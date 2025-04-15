let socket = WebSocket("ws://localhost:8000/ws");

let chat  =  document.getElementById("chat");
let inpurt = document.getElementById("msg");
let send = document.getElementById("send");

send.onclick = function () {   //when send button is pressed
  let text = input.value;      //takes input
  imput.value = "";            //clears it now that send has been hit
  let ciphertext = encrypt(text); //encrypts the message
  socket.send(ciphertext);        //sends the message
};

socket.onmessage = function (event) {    //creates the function, receives message
  let plaintext  = decrypt(event.data);  //decrypts the message
  let line = document.createElement("div");   //creates the line element
  line.textContent = plaintext; //assigns the plaintext to the line
  chat.appendChild(line);  //adds the line to the chat
  chat.scrollTop = child.scrollHeight;
};
