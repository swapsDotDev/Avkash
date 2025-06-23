from fastapi import WebSocket, WebSocketDisconnect
import json
from fastapi import APIRouter
from websocket.ConnectionManager import manager

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                json.loads(data)
                await manager.broadcast(data)
            except json.JSONDecodeError:
                await manager.broadcast(json.dumps({"raw_message": data}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
