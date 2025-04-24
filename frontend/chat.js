const routes = {
  "/chat": "chat",
  "/about": "about",
  "/crypto": "crypto"
};

let messageBuffer = [];
let latestUserList = null;

let socket = new WebSocket("ws://" + window.location.host + "/ws");    //keeps websocket up all the time

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({
    type: "refresh"
  })); // trigger the server to send user-list just to this client
});

socket.onmessage = handleSocketMessage;     //when the corresponding websocket receives a message, it goes to the handler

function handleSocketMessage(event) {
  const chat = document.getElementById("chat");
  if (!chat) return; // no chat window visible, this allows the chat to run in the background
  try {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "chat":
        displayChatMessage(data);     //displays chat messages
        break;
      case "user-list":
        updateUserList(data);        //if message of type user-list, update the user list accordingly
        break;
      default:
        console.warn("Unknown message type:", data.type);     //fallback if unknown typing
    }
  } catch (err) {
    console.error("Failed to parse message:", err);
    fallbackDisplayMessage(event.data);
  }
}

function displayChatMessage(data) {
  messageBuffer.push(data); //saves all messages to the storage
  const plaintext = decrypt(data.message);
  const line = document.createElement("div");
  line.className = "msg";
  line.textContent = `${data.from}: ${plaintext}`;
  chat.appendChild(line);
  chat.scrollTop = chat.scrollHeight;
}

function fallbackDisplayMessage(rawText) {     //runs if doesnt know how to parse the json, or if message isnt json at all
  const line = document.createElement("div");
  line.className = "msg";
  line.textContent = decrypt(rawText);
  chat.appendChild(line);
  chat.scrollTop = chat.scrollHeight;
}

function updateUserList(data) {      
  latestUserList = data;                       
  const userListBox = document.getElementById("user-list");
  if (!userListBox) return;

  const { count, names } = data;     //grabs the count and names from the json input
  userListBox.innerHTML = `
    <strong>Connected users: ${count}</strong><br>   
    ${names.map(name => `• ${name}`).join("<br>")}     
  `;
}    //adds the users as bulletpoints


// Set up SPA router
function navigateTo(url) {
  history.pushState(null, null, url);         //updates the url
  router();                                   //returns some html depending on the url
}

function router() {                       //connects clicking on pages with the corresponding html for that page
  const path = window.location.pathname;
  const page = routes[path] || "chat";

  fetch(`/static/${page}.html`)     //gets the html from the files
    .then(res => res.text())
    .then(html => {document.getElementById("content").innerHTML = html;       //takes the html and puts it in the content section within index.html
      setupChat();  //runs setup chat to produce the messages
      
    });
    if (latestUserList) {
      updateUserList(latestUserList);
    } else {
      socket.send(JSON.stringify({
        type: "refresh"
      }));
    }
}

// Intercept internal link clicks
document.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigateTo(e.target.getAttribute("href"));
  }
});

window.addEventListener("popstate", router);
// Load correct page on startup
window.addEventListener("DOMContentLoaded", router);

function setupChat() {
  
  
  let chat = document.getElementById("chat");               //finds the elements in the html
  let input = document.getElementById("msgbar");        
  let send = document.getElementById("send");

  if (!chat || !input || !send) return; // if the page isn't the chat page

  messageBuffer.forEach(data => {                //for every element in the buffer, it adds that to the chat
    const plaintext = decrypt(data.message);     //means the buffer only stores encrypted data still
    const line = document.createElement("div");  //creates the element line to write each line of the message to
    line.className = "msg";                      //gives the line element a class
    line.textContent = `${data.from}: ${plaintext}`;       
    chat.appendChild(line);                           //adds the line to the chat element
  });
  chat.scrollTop = chat.scrollHeight;

  send.onclick = function () {                           //on click
    let text = input.value;                              //grabs text from input bar
    input.value = "";                                    //resets the text in the bar

    if (text.startsWith("/")) {
      let parts = text.slice(1).split(" ");  // remove '/' and split
      let command = parts[0];
      let arg = parts.slice(1).join(" ");    // supports multiple-word args
      socket.send(JSON.stringify({
        type: "command",
        command: command,
        arg: arg
      }))

    } else {

    let ciphertext = encrypt(text);                      //encrypts the text
    socket.send(JSON.stringify({
      type: "chat",
      message: ciphertext
    }))};                             //sends the text
  };

  input.addEventListener("keydown", function (event) {   //allows for above process with enter
    if (event.key === "Enter") {
      send.click();
    }
  });
}
