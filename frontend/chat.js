document.addEventListener("DOMContentLoaded", function () {
  let socket = new WebSocket("ws://" + window.location.host + "/ws");  //creates a websocket from that port

  let chat  =  document.getElementById("chat");   //defines caht by finding chat in the html
  let input = document.getElementById("msgbar");     //finds msg in the html
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
    try {
      const data = JSON.parse(event.data);                //parses the json

      if (data.type === "chat") {
        const plaintext = decrypt(data.message);          //decrypts the message
        const line = document.createElement("div");       //creates the line element
        line.className = "msg";                           //creates a new class called msg which is applies to the data
        line.textContent = `${data.from}: ${plaintext}`;  //assigns the plaintext to the line
        chat.appendChild(line);                           //adds the line to the chat
        chat.scrollTop = chat.scrollHeight;               //scrolls to bottom of the chat box
      } else if (data.type === "user-list") {
        const userListBox = document.getElementById("user-list");
        if (!userListBox) return;

        const count = data.count;
        const names = data.names;

        userListBox.innerHTML = `
          <strong>Connected users: ${count}</strong><br>
          ${names.map(name => `• ${name}`).join("<br>")}
        `;
      }
    } catch (err) {
      console.error("Failed to parse message:", err);
      const line = document.createElement("div");
      line.className = "msg";
      line.textContent = decrypt(event.data); // fallback to plaintext decrypt
      chat.appendChild(line);
      chat.scrollTop = chat.scrollHeight;
    }

  };
});
