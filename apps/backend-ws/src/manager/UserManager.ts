import { RedisManager } from "./RedisManager";
import { RoomManager } from "./RoomManager";
import { WebSocket } from "ws";

export interface User {
    socket: WebSocket;
    userId: string;
}

export class UserManager {
    public users: User[];
    
    constructor() {
        this.users = [];
    }

    async addUser(userId: string, socket: WebSocket) {
        this.users.push({ userId, socket });
        const redis = RedisManager.getInstance().client;

        await redis.lpush("waiting_users", userId);
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socket: WebSocket, isNew: boolean = false) {
        const user = this.users.find(x => x.socket === socket);
        if (!user) return;
        this.users = this.users.filter(x => x.socket !== socket);
        RoomManager.getInstance().removeRoom(user.userId, isNew);

        this.clearQueue();
    }

    async clearQueue() {
        const redis = RedisManager.getInstance().client;
        const userId1 = await redis.lpop("waiting_users");
        const userId2 = await redis.lpop("waiting_users");

        if (!userId1 || !userId2 || userId1 === userId2)  {
            if (userId1) redis.lpush("waiting_users", userId1);
            return;
        }

        console.log(`Matching users: ${userId1} & ${userId2}`);

        const user1 = this.users.find(x => x.userId === userId1);
        const user2 = this.users.find(x => x.userId === userId2);

        if (!user1 || !user2) return;
        RoomManager.getInstance().createRoom(user1, user2);

        this.clearQueue();
    }

    initHandlers(socket: WebSocket) {
        socket.on("message", (message) => {
            const data = JSON.parse(message.toString());
            switch (data.type) {
                case "message":
                    RoomManager.getInstance().onMessage(data.message, data.senderId);
                    break;
                case "offer":
                    RoomManager.getInstance().onOffer(data.roomId, data.sdp, data.senderId);
                    break;
                case "answer":
                    RoomManager.getInstance().onAnswer(data.roomId, data.sdp, data.senderId);
                    break;
                case "ice-candidate":
                    RoomManager.getInstance().onIceCandidates(data.roomId, data.senderId, data.candidate);
                    break;
            }
        });
        socket.on("close", () => {
            this.removeUser(socket);
        });
    }
}
