import { RedisManager } from "./RedisManager";
import { RoomManager } from "./RoomManager";
import { WebSocket } from "ws";

export interface User {
    socket: WebSocket;
    userId: string;
}

export class UserManager {
    public users: User[] = [];
    
    constructor() {
    RedisManager.getInstance().subscribe("match_maker", this.matchMaker.bind(this));
    RedisManager.getInstance().subscribe("user", this.onMessage.bind(this));
    }


    public matchMaker(message: string) {
        const { roomId, users } = JSON.parse(message);

        RoomManager.getInstance().createRoom(roomId, users[0], users[1]);

        const payload = {
            type: "send-offer",
            roomId
        };

        RedisManager.getInstance().publish("user", JSON.stringify({ roomId, userId: users[0], payload }));
        RedisManager.getInstance().publish("user", JSON.stringify({ roomId, userId: users[1], payload }));
    }

    public onMessage(message: string) {
        const { userId: senderId } = JSON.parse(message);

        if (!this.users.find(x => x.userId === senderId)) {
            console.log("User not found:", senderId);
            return;
        }

        const user = this.users.find(x => x.userId === senderId);
        if (!user) return;

        user.socket.send(JSON.stringify(message));
    }

    initHandlers(socket: WebSocket) {
        socket.on("message", (message) => {
            const data = JSON.parse(message.toString());
            switch (data.type) {
                case "message":
                    RoomManager.getInstance().onMessage(data.message, data.senderId, data.roomId);
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

    async addUser(userId: string, socket: WebSocket) {
        this.users.push({ userId, socket });
        const redis = RedisManager.getInstance().client;
        await redis.lpush("waiting_users", userId);
        this.initHandlers(socket);
    }

    removeUser(socket: WebSocket, isNew: boolean = false) {
        const user = this.users.find(x => x.socket === socket);
        if (!user) return;
        this.users = this.users.filter(x => x.socket !== socket);
        RoomManager.getInstance().removeRoom(user.userId, isNew);
    }

}
