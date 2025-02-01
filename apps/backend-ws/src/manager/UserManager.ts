import { RoomManager } from "./RoomManager";

export interface User {
    socket: WebSocket;
    name: string;
}

export class UserManager {
    private users: User[];
    private queue: WebSocket[];
    private roomManager: RoomManager;
    
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
    }

    addUser(name: string, socket: WebSocket) {
        this.users.push({
            name, socket
        })
        this.queue.push(socket);
        // socket.emit("lobby");
        this.clearQueue();
        this.initHandlers(socket);
    }

    removeUser(socket: WebSocket) {
        this.users = this.users.filter(x => x.socket !== socket);
        this.queue = this.queue.filter(x => x === socket);
    }

    clearQueue() {
        console.log("inside clear queues")
        console.log(this.queue.length);
        if (this.queue.length < 2) {
            return;
        }
        const socket1 = this.queue.pop();
        const socket2 = this.queue.pop();
        console.log("id is " + socket1 + " " + socket2);
        const user1 = this.users.find(x => x.socket === socket1);
        const user2 = this.users.find(x => x.socket === socket2);

        if (!user1 || !user2) {
            return;
        }
        console.log("creating roonm");

        const room = this.roomManager.createRoom(user1, user2);
        this.clearQueue();
    }

    initHandlers(socket: WebSocket) {


        // socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
        //     this.roomManager.onOffer(roomId, sdp, socket);
        // })

        // socket.on("answer",({sdp, roomId}: {sdp: string, roomId: string}) => {
        //     this.roomManager.onAnswer(roomId, sdp, socket);
        // })

        // socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
        //     this.roomManager.onIceCandidates(roomId, socket, candidate, type);
        // });
    }

}