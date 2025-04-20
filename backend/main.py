from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from commands import COMMANDS
from utils import broadcast_user_count
#imports all the relevent modules to create Sockets and share messages

app = FastAPI()   #creates the application object
connections = {}  #a dict of all websockets/clients connected to the website

@app.websocket("/ws")       #defines a route at ws for websocket connections
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()                           #waits for a websocket connection
    client_ip = websocket.client.host
    connections[websocket] = {                         #creates the clients profile as a dict
        "name": "Anonymous",
        "room": "main",
        "ip": client_ip,
        "muted": False,
    }
    
    await broadcast_user_count(connections)

    try:
        while True:
            data = await websocket.receive_text()      #waits for a message from the user 
            if data.startswith("/"):
                try:
                    cmd, arg = data[1:].split(" ",1)
                except ValueError:
                    cmd, arg = data[1:], ""

                if cmd in COMMANDS:
                    await COMMANDS[cmd](websocket, arg, connections)
                else:
                    await websocket.send_text(connections[websocket]["name"] + ": unknown command /" + cmd)
                continue

            if connections[websocket]["muted"]:        #checks for user mute
                continue

            sender = connections[websocket]

            for conn, profile in connections.items():                #loops through every users dict
                if profile["room"] == sender["room"]:                #checks it is sending to correct room
                    await conn.send_json({"type": "chat",
                                           "from": sender['name'],
                                           "room": sender['room'],
                                           "message": data})         #sends the text to that user
    except WebSocketDisconnect:                                      #if disconnect
        del connections[websocket]                                   #take them off of the list
        await broadcast_user_count(connections)                                 #still await for user count change



app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")    #serves the frontend
