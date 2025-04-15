from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles


app = FastAPI()
connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for conn in connections:    
                await conn.send_text(data)
    except WebSocketDisconnect:
        connections.remove(websocket)

app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
