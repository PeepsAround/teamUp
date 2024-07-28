import { RoomManager } from "./RoomManager";
import { Socket } from "socket.io";

export interface User {
    socket: Socket;
    name: string;
    withAIMentor: boolean;
}

export class UserManager {
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;
    private socketToUser: Map<string, string>;
    
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager();
        this.socketToUser = new Map()
    }

    getTime(){
        const timestamp = new Date().getTime();
	    const date = new Date(timestamp);
        const humanReadableDate = date.toUTCString();
        return "["+ humanReadableDate +"] : ";
    }

    getUserFromSocketId(socketId: string){
        if (this.socketToUser.has(socketId)){
            return this.socketToUser.get(socketId);
        }
        return "UNKNOWN";
    }

    addUser(name: string, socket: Socket, withAIMentor: boolean = false) {
        this.users.push({
            name, socket, withAIMentor
        })
        this.socketToUser.set(socket.id, name);
        
        if(!withAIMentor){
            this.queue.push(socket.id);
            socket.emit("lobby");
            this.clearQueue();
            this.initHandlers(socket);
        }
    }

    removeUser(socketId: string) {
        const user = this.users.find(x => x.socket.id === socketId);
        if (user) {
            const leftOutUser = this.roomManager.userLeft(user);
            if (leftOutUser) {
                console.log(this.getTime() +"[UserManager : RemoveUser] Left out user : " + leftOutUser.name + " put to the queue");
                this.queue.push(leftOutUser.socket.id);
            }
            this.clearQueue();
        }
        
        this.users = this.users.filter(x => x.socket.id !== socketId);
        console.log(this.getTime() +"[UserManager : RemoveUser] Removed the leaving user : " + this.getUserFromSocketId(socketId) + " from the users queue");

        this.queue = this.queue.filter(x => x !== socketId);
        console.log(this.getTime() +"[UserManager : RemoveUser] Removed the leaving user : " + this.getUserFromSocketId(socketId) + " from the matching queue");
    }

    getcount(){
        return this.users.length;
    }

    userLeft(socketId: string) {
        const user = this.users.find(x => x.socket.id === socketId);
        if (user) {
            const receivingUser = this.roomManager.userLeft(user);
            this.clearQueue();
            
            // Generate a random delay between 0 and 6000 milliseconds (0 to 6 seconds)
            setTimeout(() => {
                this.queue.push(socketId);
                if (receivingUser) {
                    this.queue.push(receivingUser.socket.id);
                }
                this.clearQueue();
            }, 1000);
        }
    }

    userIsWithAIMentor(socketId: string) {
        this.queue = this.queue.filter(x => x !== socketId);
       this.clearQueue()
    }
    

    clearQueue() {
        console.log(this.getTime() +"[UserManager : ClearQueue] Clearing the queues")
        console.log(this.getTime() +"[UserManager : ClearQueue] Waiting queue lenght is :", this.queue.length);
        if (this.queue.length < 2) {
            return;
        }

        const id1 = this.queue.shift();
        const id2 = this.queue.pop();

        // Condition to avoid getting in a call with ourselves.
        if(id1 == id2){
            console.log(this.getTime() +"[UserManager : ClearQueue] Duplicate user : " + this.getUserFromSocketId(id1 || "") + " detected!")
            //@ts-ignore
            this.queue.push(id1);
            return;
        }

        console.log(this.getTime() +"[UserManager : ClearQueue] Users " + this.getUserFromSocketId(id1 || "") + " " + this.getUserFromSocketId(id2 || "") + ", entered the chat");
        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);

        if (!user1 || !user2) {
            return;
        }
        console.log(this.getTime() +"[UserManager : ClearQueue] Creating a new room for " + this.getUserFromSocketId(id2 || "") + " and " + this.getUserFromSocketId(id1 || ""));

        const room = this.roomManager.createRoom(user1, user2);
        // this may be redundant if clearQueue is also called after a user exits the room 
        this.clearQueue();
    }

    initHandlers(socket: Socket) {
        /*
        1. Server sends event "send-offer" to user1 with roomId
        2. user1 sends event "offer" to server with sdp and roomId
        3. server receives the event "offer" and calls onOffer 
        */
        socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        })

        /*
        1. Server sends event "offer" to user2 with sdp of user1 and roomId
        2. user2 sends event "answer" to server with it's sdp and roomId
        3. server receives the event "answer" and calls onAnswer 
        */

        socket.on("answer",({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        })

        socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }
}