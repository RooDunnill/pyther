export const socket = new WebSocket("ws://" + window.location.host + "/ws");
export let sendQueue = [];