import { encrypt, decrypt } from "./crypto.js";
import { socket, sendQueue } from "./socket.js";  // imports the socket here too


export let latestUserList = null;
export let currentRoom = "mainRoom"
let roomBuffers = {};


export function handleSocketMessage(event) {
  console.log("handleSocketMessage function called")
  const chat = document.getElementById("chat");
  if (!chat) {         //for when the page isn't a chat page
    console.log("no chat window, skipping")
    return; // no chat window visible, this allows the chat to run in the background
  }
  try {
    const data = JSON.parse(event.data);
    console.log("message received of type", data.type)
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
  console.log("displayChatMessage function called, room:", data.room) 
  if (!roomBuffers[data.room]) roomBuffers[data.room] = [];    //if the buffer doesnt yet exist for that chat, it will create it
  console.log("saving messages to buffer")
  roomBuffers[data.room].push(data);
  if (data.room !== currentRoom) return;  // only show if in current room
  appendMessageToChat(data)
}


function appendMessageToChat(data) {                               //general chat adder
  console.log("appendMessageToChat function called")               //logs that the function has been called
  const chat = document.getElementById("chat");                    //gets the chat element in index.html
  const plaintext = decrypt(data.message);                         //decrypts the data
  const line = document.createElement("div");                      //creates a line element
  line.className = "msg";                                          //assigns the class 'msg' to the element
  line.textContent = `${data.from}: ${plaintext}`;                 //adds the username infront of the message plaintext
  chat.appendChild(line);                                          //adds to the chat element
  chat.scrollTop = chat.scrollHeight;                              //autoscrolls to the bottom
}


export function updateUserList(data) {     
  console.log("updateUserList function called")         
  latestUserList = data;                                             //assigns the given json data to a variable
  const userListBox = document.getElementById("user-list");          //grabs the user-list element from the html
  if (!userListBox) return;                                          //checks if the html is actually there before updating it
  const { count, names } = data;                                     //grabs the count and names from the json input and assigns them as variables
  userListBox.innerHTML = `                                         
    <strong>Connected users: ${count}</strong><br>   
    ${names.map(name => `• ${name}`).join("<br>")}     
  `;
}    //adds the users as bulletpoints


export function setupChat() {
  console.log("setupChat called")
  let chat = document.getElementById("chat");               //finds the elements in the html
  let input = document.getElementById("msgbar");        
  let send = document.getElementById("send");
  console.log("chat element:", !!chat, "input element:", !!input, "send element:", !!send);
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


export function switchRoom(room) {              
  console.log("switchRoom function called, room:", room)
  function doSwitch() {                                          //defines the core logic in an internal function to improve readability
    currentRoom = room;
    clearChat();
    
    const roomTitle = document.getElementById("base-bar");
    if (roomTitle) {
      if (room === "mainRoom") {
        roomTitle.textContent = "Homeroom";    //defines the title for each room, probably a btter way to do this in the form of a dict maybe
      } else if (room === "sideRoom") {
        roomTitle.textContent = "Side Room";
      } else {
        roomTitle.textContent = room; // fallback
      }
    }

    const messages = roomBuffers[room] || [];
    messages.forEach(appendMessageToChat);
  }

  if (socket.readyState === WebSocket.OPEN) {      //runs if open
    doSwitch();
  } else {
    socket.addEventListener("open", doSwitch, { once: true });    //queues till it is open
  }
}


function clearChat() {                                //wipes all messages from the chat
  console.log("clearChat function called")
  const chat = document.getElementById("chat");
  if (chat) chat.innerHTML = "";                      //makes the text in the chat element empty
}


function clearRoomBuffer(room) {                      //if it exists, erase it  
    console.log("clearRoomBuffer function called")
    roomBuffers[room] = [];
}


export function safeSend(data) {                     //only sends messages when it is safe to do so, ie there is a websocket connection
  console.log("safeSend function called")            //if not, it will store them, and then send them when the websocket connection is accessed
  if (socket.readyState === WebSocket.OPEN) {        //if the websocket is open
    socket.send(JSON.stringify(data));               //send the data as a JSON package
  } else if (socket.readyState === WebSocket.CONNECTING) {  //if the websocket is still connecting
    sendQueue.push(data);                            // queue it for later
  } else {
    console.warn("WebSocket not open and not connecting. Message dropped:", data);
  }
}
