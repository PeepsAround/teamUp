import { User } from "./UserManger";

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

    getTime(){
        const timestamp = new Date().getTime();
	    const date = new Date(timestamp);
        const humanReadableDate = date.toUTCString();
        return "["+ humanReadableDate +"] : ";
    }

    createRoom(user1: User, user2: User) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(), {
            user1, 
            user2,
        })
        
        //server is sending event "send-offer" to user1, in return the user1 will send sdp
        user1.socket.emit("send-offer", {
            roomId
        })
        //this may be redundant
        user2.socket.emit("send-offer", {
            roomId
        })
    }

    onOffer(roomId: string, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const [sendingUser, receivingUser] = room.user1.socket.id === senderSocketid ? [room.user1, room.user2]: [room.user2, room.user1];
        // Server sends an event "offer" to user2 with sdp of user1 and roomId
        receivingUser?.socket.emit("offer", {
            sdp,
            roomId,
            partnerName: sendingUser.name
        })
    }
    
    onAnswer(roomId: string, sdp: string, senderSocketid: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
        // Server sends an event "offer" to user1 with sdp of user2 and roomId
        receivingUser?.socket.emit("answer", {
            sdp,
            roomId
        });
    }

    onIceCandidates(roomId: string, senderSocketid: string, candidate: any, type: "sender" | "receiver") {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2: room.user1;
        receivingUser.socket.emit("add-ice-candidate", ({candidate, type}));
    }

    userLeft(user: User) {
        var roomId : string | null = null;
        for (let [key, value] of this.rooms.entries()) {
            if (value.user1 === user || value.user2 === user) {
                roomId = key;
                break;
            }
        }

        if (roomId) {
            const room = this.rooms.get(roomId);
            if (room) {
                const receivingUser = room.user1 === user ? room.user2: room.user1;
                console.log(this.getTime() + "[RoomManager.ts : UserLeft] " + user.name + " left, Notifing" + receivingUser.name + " to skip");
                receivingUser.socket.emit("skip");
                this.rooms.delete(roomId);
                return receivingUser;
            }
        }else{
            console.log(this.getTime() + "[RoomManager.ts : UserLeft] " + user.name + " left, No other user remaining");
        }
        return null;
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }

}