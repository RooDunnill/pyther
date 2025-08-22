import { handleSocketMessage } from "./chat.js";
import { router, handleLinkClick } from "./router.js";
import { socket, sendQueue } from "./socket.js";

socket.addEventListener("open", () => {
  console.log("socket connected, now refreshing page")
  socket.send(JSON.stringify({ type: "refresh" }));

  for (const queued of sendQueue) {
    console.log("flushing queued messages now connected", queued)
    socket.send(JSON.stringify(queued));
  }
  sendQueue.length = 0; // clear after flushing
});


socket.onmessage = handleSocketMessage;     //when the corresponding websocket receives a message, it goes to the handler

// Intercept internal link clicks
document.addEventListener("click", handleLinkClick);


window.addEventListener("DOMContentLoaded", () => router());
window.addEventListener("popstate", () => router());

