import { RedisManager } from "./RedisManager";
import { User } from "./UserManager";

let GLOBAL_ROOM_ID = 1;

interface Room {
    user1: string;
    user2: string;
}

export class RoomManager {
    private rooms: Map<string, Room>;
    private static instance: RoomManager;

    private constructor() {
        this.rooms = new Map();
    }

    public static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }   

    getUsers(roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        return [room.user1, room.user2];
    }

    removeRoom(userId: string, isNew: boolean) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.user1 === userId || room.user2 === userId) {
                if (isNew) {
                    RedisManager.getInstance().publish("user", JSON.stringify({ type: "user-disconnected", roomId, userId: room.user1 }));
                    RedisManager.getInstance().publish("user", JSON.stringify({ type: "user-disconnected", roomId, userId: room.user2 }));
                } else {
                    const receiver = room.user1 === userId ? room.user2 : room.user1;
                    RedisManager.getInstance().publish("user", JSON.stringify({ type: "user-disconnected", roomId, userId: receiver }));
                }
                this.rooms.delete(roomId);
                console.log(`Room removed: ${roomId}`);
            }
        }
        return undefined;
    }
    
    createRoom(roomId: string, user1: User, user2: User) {
        this.rooms.set(roomId, { user1: user1.userId, user2: user2.userId });
    }

    getReceiver(roomId: string, senderId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receiver = room.user1 === senderId ? room.user2 : room.user1;
        return receiver;
    }

    onOffer(roomId: string, sdp: string, senderId: string) {
        const receiver = this.getReceiver(roomId, senderId);
        if (!receiver) return;
        RedisManager.getInstance().publish("user", JSON.stringify({ roomId, userId: receiver, payload: { type: "offer", sdp, roomId } }));
    }

    onAnswer(roomId: string, sdp: string, senderId: string) {
        const receiver = this.getReceiver(roomId, senderId);
        if (!receiver) return;
        RedisManager.getInstance().publish("user", JSON.stringify({ roomId, userId: receiver, payload: { type: "answer", sdp, roomId } }));
    }

    onIceCandidates(roomId: string, senderId: string, candidate: any) {
        const receiver = this.getReceiver(roomId, senderId);
        RedisManager.getInstance().publish("user", JSON.stringify({ roomId, userId: receiver, payload: { type: "ice-candidate", candidate, roomId } }));
    }

    onMessage( message: string, senderId: string, roomId: string) {
        const receiver = this.getReceiver(roomId, senderId);
        RedisManager.getInstance().publish("user", JSON.stringify({ roomId, userId: receiver, payload: { type: "message", message, senderId } }));

    }
}
