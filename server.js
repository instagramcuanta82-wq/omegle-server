const WebSocket = require("ws");
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

let waiting = null;

wss.on("connection", ws => {
    console.log("Usuario conectado");

    if (waiting === null) {
        waiting = ws;
        ws.send(JSON.stringify({ type: "status", msg: "Esperando otro usuario..." }));
    } else {
        const partner = waiting;
        waiting = null;

        ws.partner = partner;
        partner.partner = ws;

        ws.send(JSON.stringify({ type: "status", msg: "Pareja encontrada" }));
        partner.send(JSON.stringify({ type: "status", msg: "Pareja encontrada" }));
    }

    ws.on("message", msg => {
        if (ws.partner && ws.partner.readyState === WebSocket.OPEN) {
            ws.partner.send(msg);
        }
    });

    ws.on("close", () => {
        if (ws.partner && ws.partner.readyState === WebSocket.OPEN) {
            ws.partner.send(JSON.stringify({ type: "status", msg: "El otro se desconectó" }));
            ws.partner.partner = null;
        }
        if (waiting === ws) waiting = null;
    });
});

console.log("Servidor WebSocket running");
