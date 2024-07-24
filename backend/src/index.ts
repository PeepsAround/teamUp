import { Server } from 'socket.io';
import { Socket } from "socket.io";
import { UserManager } from "./managers/UserManger";
import http from "http";

const server = http.createServer(http);

const io = new Server(server, {
	cors: {
		origin: "*"
	}
});

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {

	const IDLE_TIMEOUT = 11000;
	// Initialize a timeout for the client
	let idleTimeout = setTimeout(() => {
		console.log('Disconnecting idle client with socket Id:', socket.id);
		userManager.removeUser(socket.id);
		socket.disconnect(true);
	}, IDLE_TIMEOUT);

	// Reset the timeout whenever the client sends any data
	socket.on('anyEvent', (data) => {
		console.log('Client alive with socket Id:', socket.id);
		clearTimeout(idleTimeout);
		idleTimeout = setTimeout(() => {
			console.log('Disconnecting idle client with socket Id:', socket.id);
			userManager.removeUser(socket.id);
			socket.disconnect(true);
		}, IDLE_TIMEOUT);
	});

	console.log('a user connected', socket.handshake.query['name']);
	userManager.addUser(socket.handshake.query['name'] as string, socket);
	
	socket.on("disconnect", () => {
		console.log("user disconnected");
		userManager.removeUser(socket.id);
		socket.disconnect(true);
	})
	
	socket.on("leave", () => {
		console.log("user disconnected");
		userManager.removeUser(socket.id);
		socket.disconnect(true);
	})

	socket.on("skip", () => {
		// remove room
		userManager.userLeft(socket.id);
	})
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});