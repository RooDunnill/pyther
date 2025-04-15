let socket = new WebSocket("ws://" + window.location.host + "/ws");  //creates a websocket from that port

let chat  =  document.getElementById("chat");   //defines caht by finding chat in the html
let input = document.getElementById("msg");     //finds msg in the html
let send = document.getElementById("send");     //finds send in the html



send.onclick = function () {   //when send button is pressed
  let text = input.value;      //takes input
  input.value = "";            //clears it now that send has been hit
  let ciphertext = encrypt(text); //encrypts the message
  socket.send(ciphertext);        //sends the message
};

input.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    send.click();
  }
});

socket.onmessage = function (event) {         //creates the function, receives message
  let plaintext  = decrypt(event.data);       //decrypts the message
  let line = document.createElement("div");   //creates the line element
  line.textContent = plaintext;               //assigns the plaintext to the line
  chat.appendChild(line);                     //adds the line to the chat
  chat.scrollTop = chat.scrollHeight;         //scrolls to bottom of the chat box
};
