var express = require("express");
var app = express();
var expressWs = require("express-ws")(app);

let participants = [];
let messages = [];

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
    }
  });
});

app.listen(8000);
