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
        this.users.push({ userId, socket });
        this.queue.push(userId);
        console.log("Added user:", userId);
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socket: WebSocket) {
        const user = this.users.find(x => x.socket === socket);
        if (!user) return;
        
        this.users = this.users.filter(x => x.socket !== socket);
        this.queue = this.queue.filter(x => x !== user.userId);
        console.log(`Removed user: ${user.userId}`);
    }

    clearQueue() {
        if (this.queue.length < 2) return;
        
        const userId1 = this.queue.pop()!;
        const userId2 = this.queue.pop()!;
        console.log(`Matching users: ${userId1} & ${userId2}`);

        const user1 = this.users.find(x => x.userId === userId1);
        const user2 = this.users.find(x => x.userId === userId2);

        if (!user1 || !user2) return;
        this.roomManager.createRoom(user1, user2);

        this.clearQueue();
    }

    initHandlers(socket: WebSocket) {
        socket.on("message", (message) => {
            const data = JSON.parse(message.toString());
            switch (data.type) {
                case "offer":
                    this.roomManager.onOffer(data.roomId, data.sdp, data.senderId);
                    break;
                case "answer":
                    this.roomManager.onAnswer(data.roomId, data.sdp, data.senderId);
                    break;
                case "ice-candidate":
                    this.roomManager.onIceCandidates(data.roomId, data.senderId, data.candidate);
                    break;
            }
        });

        socket.on("close", () => {
            this.removeUser(socket);
        });
    }
}
