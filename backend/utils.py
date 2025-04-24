async def broadcast_user_count(connections):
    user_count = len(connections)
    usernames = [users["name"] for users in connections.values()]
    for conn in connections:
        await conn.send_json({"type": "user-list", "names": usernames, "count": user_count})

async def send_user_count(to_ws, connections):
    user_count = len(connections)
    usernames = [user["name"] for user in connections.values()]
    await to_ws.send_json({"type": "user-list", "names": usernames, "count": user_count})
