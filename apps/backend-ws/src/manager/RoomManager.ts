import { Socket } from "socket.io";

let GLOBAL_ROOM_ID = 0;
interface Room {
    user1: Socket;
    user2: Socket;
    roomId: number;
}

export class RoomManager {
    private rooms!: Map<string, Room>
    constructor() {
        this.rooms = new Map<string, Room>();
    }
    
    createRoom(user1: Socket, user2: Socket) {
        const roomId = this.generate();
        this.rooms.set(roomId.toString(), { user1, user2, roomId });
        user1.emit('send-offer', {
            roomId
        })
    }

    getRoomId(socketId: string) {
        for (const [roomId, room] of this.rooms) {
            if (room.user1.id === socketId || room.user2.id === socketId) {
                return roomId;
            }
        }
        return null;
    }

    removeRoom(roomId: string) {
        this.rooms.delete(roomId);
    }

    onOffer(roomId: string, sdp: string) {
        const user2 = this.rooms.get(roomId)?.user2;
        user2?.emit("offer", { sdp });
    }

    onAnswer(roomId: string, sdp: string) {
        const user1 = this.rooms.get(roomId)?.user1;
        user1?.emit("answer", { sdp });
    }

    onCandidate(roomId: string, candidate: RTCIceCandidate) {
        
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }
}