import { User } from "./UserManager";

let GLOBAL_ROOM_ID = 1;

interface Room {
    user1: User,
    user2: User,
}

export class RoomManager {
    private rooms: Map<string, Room>
    constructor() {
        this.rooms = new Map<string, Room>()
    }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(), { user1, user2 });
        user1.socket.send(JSON.stringify({ type: "send-offer", roomId }));
    }

    onOffer(roomId: string, sdp: string, senderId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.user1.userId === senderId ? room.user2 : room.user1;
        console.log("Sending offer to user", receivingUser.userId);
        receivingUser.socket.send(JSON.stringify({ type: "offer", sdp, roomId }));
    }
    
    onAnswer(roomId: string, sdp: string, senderId: string) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.user1.userId === senderId ? room.user2: room.user1;
        console.log("Sending answer to user", receivingUser.userId);
        receivingUser.socket.send(JSON.stringify({ type: "answer", sdp, roomId }));
    }   

    onIceCandidates(roomId: string, senderId: string, candidate: any) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        const receivingUser = room.user1.userId === senderId ? room.user2: room.user1;
        console.log("Sending ice candidate to user", receivingUser.userId);
        receivingUser.socket.send(JSON.stringify({ type: "ice-candidate", candidate }));
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }

}