const routes = {
  "/chat": "chat",
  "/about": "about",
  "/crypto": "crypto"
};

let currentRoom = "mainChat"
let roomBuffers = {};
let sendQueue = [];


let latestUserList = null;

let socket = new WebSocket("ws://" + window.location.host + "/ws");    //keeps websocket up all the time

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ type: "refresh" }));

  for (const queued of sendQueue) {
    socket.send(JSON.stringify(queued));
  }
  sendQueue = []; // clear after flushing
});


socket.onmessage = handleSocketMessage;     //when the corresponding websocket receives a message, it goes to the handler

function handleSocketMessage(event) {
  const chat = document.getElementById("chat");
  if (!chat) return; // no chat window visible, this allows the chat to run in the background
  try {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "chat":
        return displayChatMessage(data);       //displays chat messages
      case "user-list":
        return updateUserList(data);        //if message of type user-list, update the user list accordingly
      case "clear-chat":
        clearChat();
        clearRoomBuffer(currentRoom);
        return;
      default:
        console.warn("Unknown message type:", data.type);     //fallback if unknown typing
    }
  } catch (err) {
    console.error("Failed to parse message:", err);
  }
}

function displayChatMessage(data) {     
  if (!roomBuffers[data.room]) roomBuffers[data.room] = [];    //if the buffer doesnt yet exist for that chat, it will create it
  roomBuffers[data.room].push(data);
  if (data.room !== currentRoom) return;  // only show if in current room
  appendMessageToChat(data)
}

function appendMessageToChat(data) {    //general chat adder
  const chat = document.getElementById("chat");
  const plaintext = decrypt(data.message);
  const line = document.createElement("div");
  line.className = "msg";
  line.textContent = `${data.from}: ${plaintext}`;
  chat.appendChild(line);
  chat.scrollTop = chat.scrollHeight;
}


function updateUserList(data) {              
  latestUserList = data;                       
  const userListBox = document.getElementById("user-list");
  if (!userListBox) return;     //checks if the html is actually there before updating it

  const { count, names } = data;     //grabs the count and names from the json input
  userListBox.innerHTML = `
    <strong>Connected users: ${count}</strong><br>   
    ${names.map(name => `• ${name}`).join("<br>")}     
  `;
}    //adds the users as bulletpoints


// Set up SPA router
function navigateTo(url, room = null) {
  history.pushState(null, null, url);         //updates the url
  router(room);                                   //returns some html depending on the url
}

function router(room = null) {                       //connects clicking on pages with the corresponding html for that page
  const path = window.location.pathname;
  const page = routes[path] || "chat";

  fetch(`/static/${page}.html`)     //gets the html from the files
    .then(res => res.text())
    .then(html => {document.getElementById("content").innerHTML = html;       //takes the html and puts it in the content section within index.html
      setupChat();

      if (room) {
        switchRoom(room);
      }
      if (latestUserList) {
        updateUserList(latestUserList);
      } else {
        safeSend({
          type: "refresh",
          room: currentRoom});
      }
    });   //runs setup chat to produce the messages
}

// Intercept internal link clicks
document.addEventListener("click", handleLinkClick);


function handleLinkClick(e) {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigateTo(e.target.getAttribute("href"));
  }

  if (e.target.matches("[data-room]")) {
    e.preventDefault();
    
    const room = e.target.getAttribute("data-room");

    // If we're not already on the /chat page, navigate to it
    if (window.location.pathname !== "/chat") {
      navigateTo("/chat", room);
    } else {
      switchRoom(room);
    }
  }
}


window.addEventListener("popstate", router);
// Load correct page on startup
window.addEventListener("DOMContentLoaded", router);

function setupChat() {
  let chat = document.getElementById("chat");               //finds the elements in the html
  let input = document.getElementById("msgbar");        
  let send = document.getElementById("send");

  if (!chat || !input || !send) return; // if the page isn't the chat page

  send.onclick = function () {                           //on click
    let text = input.value;                              //grabs text from input bar
    if (!input.value) return                             //prevents empty messages from being sent
    input.value = "";                                    //resets the text in the bar

    if (text.startsWith("/")) {  
      let parts = text.slice(1).split(" ");  // remove '/' and split
      let command = parts[0];
      let arg = parts.slice(1).join(" ");    // supports multiple-word args
      safeSend({
        type: "command",
        command: command,
        arg: arg})
    } else {
    let ciphertext = encrypt(text);                      //encrypts the text
    safeSend({
      type: "chat",
      room: currentRoom,
      message: ciphertext
    })};                             //sends the text
  };

  input.addEventListener("keydown", function (event) {   //allows for above process with enter
    if (event.key === "Enter") {
      send.click();
    }});
}


function switchRoom(roomName) {
  if (roomName === currentRoom) return;

  function doSwitch() {
    currentRoom = roomName;
    clearChat();

    safeSend({
      type: "switch_room",
      room: roomName
    });

    const messages = roomBuffers[roomName] || [];
    messages.forEach(appendMessageToChat);
  }

  if (socket.readyState === WebSocket.OPEN) {
    doSwitch();
  } else {
    socket.addEventListener("open", doSwitch, { once: true });
  }
}


function clearChat() {    //wipes all messages from the chat
  const chat = document.getElementById("chat");
  if (chat) chat.innerHTML = "";
}

function clearRoomBuffer(roomName) {     //if it exists, erase it  
    roomBuffers[roomName] = [];
}


function safeSend(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else if (socket.readyState === WebSocket.CONNECTING) {
    sendQueue.push(data);  // queue it for later
  } else {
    console.warn("WebSocket not open and not connecting. Message dropped:", data);
  }
}
