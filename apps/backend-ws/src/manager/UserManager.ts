import { Socket } from 'socket.io';
import { RoomManager } from './RoomManager';

let GOLBAL_ROOM_ID = 0;

export class UserManager {
    private users: Socket[];
    private queue: string[];
    private roomManager: RoomManager;
    constructor () {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(socket: Socket) {
        this.users.push(socket);
        this.queue.push(socket.id);
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socketId: string) {
        const roomId = this.roomManager.getRoomId(socketId);
        if (!roomId) return;
        this.roomManager.removeRoom(roomId);
        this.users = this.users.filter((soc: Socket) => soc.id !== socketId);
    }

    clearQueue() {
        if (this.queue.length < 2) return;
        const user1 = this.users.find((soc: Socket) => soc.id === this.queue.shift());
        const user2 = this.users.find((soc: Socket) => soc.id === this.queue.shift());
        if (!user1 || !user2) return;
        this.roomManager.createRoom(user1, user2);
    }

    initHandlers(socket: Socket) {
        socket.on('offer', ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onOffer(roomId, sdp);
        })
        socket.on('answer', ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onAnswer(roomId, sdp);
        });
        
    }
   
}