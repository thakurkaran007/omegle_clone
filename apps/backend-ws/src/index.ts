import http from "http";
import express from "express";
import { UserManager } from "./manager/UserManager";
import { WebSocketServer, WebSocket } from "ws";

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });
const userManager = new UserManager();

wss.on("connection", function connection(ws: WebSocket) {
  ws.on("error", console.error);

  ws.on("message", function message(message) {
    const data = JSON.parse(message.toString());
    switch (data.type) {
      case "add-user":
        userManager.addUser(data.userId, ws);
        break;
      case 'remove-user':
        userManager.removeUser(ws);
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
