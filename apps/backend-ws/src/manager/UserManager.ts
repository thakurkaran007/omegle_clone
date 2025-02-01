import { RoomManager } from "./RoomManager";
import { WebSocket } from "ws";

export interface User {
    socket: WebSocket;
    userId: string;
}

export class UserManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;
    
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(userId: string, socket: WebSocket) {
        this.users.push({
            userId, socket
        })
        this.queue.push(userId);
        console.log("added user");
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socket: WebSocket) {
        const user = this.users.find(x => x.socket === socket);
        this.users = this.users.filter(x => x.socket !== socket);
        this.queue = this.queue.filter(x => x === user?.userId);
    }

    clearQueue() {
        console.log("inside clear queues")
        console.log(this.queue.length);
        if (this.queue.length < 2) return;
        const socket1 = this.queue.pop();
        const socket2 = this.queue.pop();
        console.log("id is " + socket1 + " " + socket2);
        const user1 = this.users.find(x => x.userId === socket1);
        const user2 = this.users.find(x => x.userId === socket2);

        if (!user1 || !user2) return;
        console.log("creating room");

        const room = this.roomManager.createRoom(user1, user2);
        this.clearQueue();
    }

    initHandlers(socket: WebSocket) {
        socket.on('message', (message) => {
            const data = JSON.parse(message.toString());
            switch (data.type) {
                case 'offer':
                    this.roomManager.onOffer(data.roomId, data.sdp, data.senderId);
                    break;
                case 'answer':
                    this.roomManager.onAnswer(data.roomId, data.sdp, data.senderId);
                    break;
                case 'ice-candidate':
                    this.roomManager.onIceCandidates(data.roomId, data.senderId, data.candidate);
                    break;
                default:
                    break;
            }
        });

        socket.on('close', () => {
            this.removeUser(socket);
        });
    }

}