from utils import broadcast_user_count
COMMANDS = {}

def register(name):
    def wrapper(func):
        COMMANDS[name] = func
        return func
    return wrapper

@register("name")
async def assign_name(ws, arg, connections):
    connections[ws]["name"] = arg.strip().lower()
    await broadcast_user_count(connections)

@register("help")
async def return_help(ws, arg, connections):
    sender = connections[ws]
    cmds = "\n".join(COMMANDS.keys())
    await ws.send_json({"type": "chat",
                        "from": sender['name'],
                        "room": sender['room'],
                        "message": "Here are the list of available commands:\n" + cmds})

