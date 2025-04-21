document.addEventListener("DOMContentLoaded", function () {
  let socket = new WebSocket("ws://" + window.location.host + "/ws");  //creates a websocket from that port

  let chat  =  document.getElementById("chat");   //defines caht by finding chat in the html
  let input = document.getElementById("msgbar");     //finds msg in the html
  let send = document.getElementById("send");     //finds send in the html

  socket.onmessage = handleSocketMessage;


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

  //WebSocket Message Handler
  function handleSocketMessage(event) {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "chat":
          displayChatMessage(data);
          break;

        case "user-list":
          updateUserList(data);
          break;

        default:
          console.warn("Unknown message type:", data.type);
      }

    } catch (err) {
      console.error("Failed to parse message:", err);
      fallbackDisplayMessage(event.data);
    }
  }

  //Display Chat Messages
  function displayChatMessage(data) {
    const plaintext = decrypt(data.message);
    const line = document.createElement("div");
    line.className = "msg";
    line.textContent = `${data.from}: ${plaintext}`;
    chat.appendChild(line);
    chat.scrollTop = chat.scrollHeight;
  }

  //Display Fallback for Raw Messages
  function fallbackDisplayMessage(rawText) {
    const line = document.createElement("div");
    line.className = "msg";
    line.textContent = decrypt(rawText);
    chat.appendChild(line);
    chat.scrollTop = chat.scrollHeight;
  }

  //Update User List Display
  function updateUserList(data) {
    const userListBox = document.getElementById("user-list");
    if (!userListBox) return;

    const { count, names } = data;

    userListBox.innerHTML = `
      <strong>Connected users: ${count}</strong><br>
      ${names.map(name => `• ${name}`).join("<br>")}
    `;
  }
  });

  function loadPage(name) {
    fetch(name + ".html")
      .then(res => res.text())  
      .then(html => {
        document.getElementById("content").innerHTML = html;
      });
  }