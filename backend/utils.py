async def broadcast_user_count(connections):
    user_count = len(connections)
    usernames = [users["name"] for users in connections.values()]
    for conn in connections:
        await conn.send_json({"type": "user-list", "names": usernames, "count": user_count})