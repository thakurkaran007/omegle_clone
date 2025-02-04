import { User } from "./UserManager";

let GLOBAL_ROOM_ID = 1;

interface Room {
    user1: User;
    user2: User;
}

export class RoomManager {
    private rooms: Map<string, Room>;

    constructor() {
        this.rooms = new Map();
    }

    getUsers(roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        return [room.user1, room.user2];
    }

    removeRoom(userId: string, isNew: boolean) {
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.user1.userId === userId || room.user2.userId === userId) {
                if (isNew) {
                    room.user1.socket.send(JSON.stringify({ type: "user-disconnected" }));
                    room.user2.socket.send(JSON.stringify({ type: "user-disconnected" }));
                } else {
                    const receiver = room.user1.userId === userId ? room.user2 : room.user1;
                    receiver.socket.send(JSON.stringify({ type: "user-disconnected" }));
                }
                this.rooms.delete(roomId);
                console.log(`Room removed: ${roomId}`);
            }
        }
        return undefined;
    }
    createRoom(user1: User, user2: User) {
        const roomId = (GLOBAL_ROOM_ID++).toString();
        this.rooms.set(roomId, { user1, user2 });

        console.log(`Room created: ${roomId} between ${user1.userId} & ${user2.userId}`);

        user1.socket.send(JSON.stringify({ type: "send-offer", roomId }));
        user2.socket.send(JSON.stringify({ type: "send-offer", roomId }));
    }

    onOffer(roomId: string, sdp: string, senderId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const receiver = room.user1.userId === senderId ? room.user2 : room.user1;
        receiver.socket.send(JSON.stringify({ type: "offer", sdp, roomId }));
    }

    onAnswer(roomId: string, sdp: string, senderId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const receiver = room.user1.userId === senderId ? room.user2 : room.user1;
        receiver.socket.send(JSON.stringify({ type: "answer", sdp, roomId }));
    }

    onIceCandidates(roomId: string, senderId: string, candidate: any) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const receiver = room.user1.userId === senderId ? room.user2 : room.user1;
        receiver.socket.send(JSON.stringify({ type: "ice-candidate", candidate }));
    }

    onMessage( message: string, senderId: string) {
        console.log("Message received:", message, senderId);
        let roomId: string | undefined;
        this.rooms.forEach((room, id) => {
            if (room.user1.userId === senderId || room.user2.userId === senderId) {
                roomId = id;
            }
        });
        if (!roomId) return;
        const room = this.rooms.get(roomId);
        if (!room) return;

        const receiver = room.user1.userId === senderId ? room.user2 : room.user1;
        console.log("Sending message to:", receiver.userId);
        receiver.socket.send(JSON.stringify({ type: "message", message: { message, senderId  } }));
    }
}
