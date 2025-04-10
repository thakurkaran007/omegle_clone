import http from "http";
import express from "express";
import { UserManager } from "./manager/UserManager";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";

const app = express();
const server = http.createServer(app);

app.use(cors());

const wss = new WebSocketServer({ server });
const userManager = new UserManager();

wss.on("connection", function connection(ws: WebSocket) {
  ws.on("error", console.error);

  ws.on("message", function message(message) {
    const data = JSON.parse(message.toString());
    switch (data.type) {
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }));
        break;
      case "add-user":
        if (!data.userId) {
          console.log("No user ID provided.");
          return;
        }
        userManager.addUser(data.userId, ws);
        break;
      case 'remove-user':
        if (data.isNew) {
          console.log("remove user by new");
          userManager.removeUser(ws, data.isNew);
        } else {
          userManager.removeUser(ws);
        }
        break;
      default:
        break;
    }
  });

  ws.on("close", function close() {
    console.log("Socket closed, removing user.");
    userManager.removeUser(ws);
  });
  
});

server.listen(8080, () => {
  console.log("Listening on port 8080");
});
