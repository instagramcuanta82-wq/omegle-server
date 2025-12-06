const WebSocket = require("ws");
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

let waiting = null;

wss.on("connection", ws => {
    console.log("Usuario conectado");

    if (waiting === null) {
        waiting = ws;
        ws.send(JSON.stringify({ type: "waiting" }));
    } else {
        const partner = waiting;
        waiting = null;

        ws.partner = partner;
        partner.partner = ws;

        ws.send(JSON.stringify({ type: "matched" }));
        partner.send(JSON.stringify({ type: "matched" }));
    }

    ws.on("message", msg => {
        if (ws.partner && ws.partner.readyState === WebSocket.OPEN) {
            ws.partner.send(msg);
        }
    });

    ws.on("close", () => {
        if (ws.partner && ws.partner.readyState === WebSocket.OPEN) {
            ws.partner.send(JSON.stringify({ type: "disconnect" }));
            ws.partner.partner = null;
        }

        if (waiting === ws) waiting = null;
    });
});
