import { setupChat, switchRoom, safeSend, currentRoom, latestUserList, updateUserList } from "./chat.js";



const routes = {
    "/welcome": "welcome",
    "/chat": "chat",
    "/about": "about",
    "/crypto": "crypto"
  };


  function navigateTo(url, room = null) {
    console.log("navigateTo function called, room:", room)
    history.pushState(null, null, url);         //updates the url
    router(room);                                   //returns some html depending on the url
  }

  export function router(room = null) {                       //connects clicking on pages with the corresponding html for that page
    const path = window.location.pathname;
    const page = routes[path] || "welcome";
    console.log("router function called, room:", room)
    console.log("routing to page:", page)
    fetch(`/static/html/pages/${page}.html`)     //gets the html from the files
      .then(res => res.text())
      .then(html => {document.getElementById("content").innerHTML = html;       //takes the html and puts it in the content section within index.html
        console.log("Checking HTML elements");
        console.log("chat element:", !!document.getElementById("chat"));
        console.log("msgbar element:", !!document.getElementById("msgbar"));
        setupChat();
  
        if (path === "/chat") {
            switchRoom(currentRoom); // force re-switch into the correct room
        }
      
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

  export function handleLinkClick(e) {
    console.log("handleLinkClick function called, pathname:", window.location.pathname)
    const target = e.target.closest("a");
    if (!target) return;
      
    const room = e.target.getAttribute("data-room");
    const link = target.getAttribute("href");
  
    if (link) {
      e.preventDefault();
      navigateTo(link, room);  // pass both link and optional room
    }
  }