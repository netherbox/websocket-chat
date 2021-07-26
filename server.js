var express = require("express");
var app = express();
var expressWs = require("express-ws")(app, null, {
  wsOptions: {
    clientTracking: true,
  },
});
var WebSocket = require("ws");

const port = 8000;

let participants = [];
let messages = [];

app.use("/", express.static("dist/websocket-chat"));

app.ws("/backend", (ws, req) => {
  ws.on("message", (msg) => {
    console.log(msg);

    const decoded = JSON.parse(msg);

    switch (decoded.type) {
      case "JOIN_COMMAND":
        participants.push(decoded.payload.nickName);

        ws.send(
          JSON.stringify({
            responseTo: decoded.commandId,
            type: "JOIN_COMMAND_RESPONSE",
            payload: {
              participants,
              messages,
            },
          })
        );
        break;

      case "SEND_COMMAND":
        messages = [...messages, decoded.payload.message];

        expressWs.getWss().clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "MESSAGE_CHANGED_COMMAND",
                payload: {
                  message: decoded.payload.message,
                },
              })
            );
          }
        });

        ws.send(
          JSON.stringify({
            responseTo: decoded.commandId,
            type: "SEND_COMMAND_RESPONSE",
            payload: {
              message: decoded.payload.message,
            },
          })
        );
        break;

      case "UPDATE_COMMAND":
        messages = messages.map((item) =>
          item.messageId === decoded.payload.message.messageId
            ? decoded.payload.message
            : item
        );

        expressWs.getWss().clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "MESSAGE_CHANGED_COMMAND",
                payload: {
                  message: decoded.payload.message,
                },
              })
            );
          }
        });

        ws.send(
          JSON.stringify({
            responseTo: decoded.commandId,
            type: "UPDATE_COMMAND_RESPONSE",
            payload: {
              message: decoded.payload.message,
            },
          })
        );
        break;

      case "DELETE_COMMAND":
        messages = messages.map((item) =>
          item.messageId === decoded.payload.message.messageId
            ? decoded.payload.message
            : item
        );

        expressWs.getWss().clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "MESSAGE_CHANGED_COMMAND",
                payload: {
                  message: decoded.payload.message,
                },
              })
            );
          }
        });

        ws.send(
          JSON.stringify({
            responseTo: decoded.commandId,
            type: "DELETE_COMMAND_RESPONSE",
            payload: {
              message: decoded.payload.message,
            },
          })
        );
        break;
    }
  });
});

require("dns").lookup(require("os").hostname(), function (err, address, fam) {
  console.log(
    `** WebSocket Chat Live Server is listening on ${address}:${port}, open your browser on http://${address}:${port}/`
  );
});

app.listen(port);
