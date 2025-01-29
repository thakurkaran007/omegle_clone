import { Socket, Server } from 'socket.io'
import http from 'http';
import express from 'express'
import { UserManager } from './manager/UserManager';

const app = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const user = new UserManager();

io.on('connection', (socket: Socket) => {
    user.addUser(socket);
    socket.on('disconnect', () => {
        user.removeUser(socket.id);
    })
})

app.listen(8080, () => {
    console.log("Listening on port 8080");
})