Welcome to Pyther,  
This is my website project to learn and practice my cryptographic skills  
Eventually I would like to pen test this website with one of my pis while it is hosted on the other one  
Some useful commands:  
python3 -m http.server 8080         for local hosting  
http://<pi-ip>:8080                 the url for the web  (or atleast the wifi i am on)    
uvicorn main:app --host 0.0.0.0 --port 8080          to host on the web  
All of these commands are using port 8080

To run completely independently install tmux then use:  
tmux new -s pyther  
uvicorn main:app --host 0.0.0.0 --port 8000  
Ctrl + b, then d  
tmux attach -t pyther  
tmux kill-session -t pyther  

My pi 3b+ now runs the website on its ip address on bootup and runs using systemd, which seems more reliable and stable compared to manually setting up a tmux every time  




NOTES:
I believe that the room only properly swaps over when you send a message, as you don't receive a message in a chat till you send a message in that chat  
Also naturally, if you aren't on that chat, you don't receive the messages from the other person which needs to change so that the chat buffer is updated for all users in the background  
i also don't want the messages to dissapear when i refresh the page, although that might involve some kind of storage, maybe you have the buffer on the backend rather than frontend?  