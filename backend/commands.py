COMMANDS = {}

def register(name):
    def wrapper(func):
        COMMANDS[name] = func
        return func
    return wrapper

@register("name")
def assign_name(ws, arg, connections):
    connections[ws]["name"] = arg.strip().lower()

@register("room")
def handle_room(ws, arg, connections):
    connections[ws]["room"] = arg.strip().lower()

@register("help")
def return_help(ws, connections):
    cmds = ", ".join(COMMANDS.keys())
    ws.send_text("Available commands: " + cmds)


COMMANDS = {
    "name": assign_name,
    "room": handle_room,
    "help": return_help
}
