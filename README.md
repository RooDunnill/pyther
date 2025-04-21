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


