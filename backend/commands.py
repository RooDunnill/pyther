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

@register("room")
async def handle_room(ws, arg, connections):
    connections[ws]["room"] = arg.strip().lower()

@register("help")
async def return_help(ws, arg, connections):
    cmds = ", ".join(COMMANDS.keys())
    await ws.send_text("Available commands: " + cmds)

