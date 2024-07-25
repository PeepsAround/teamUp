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
		
		console.log('[Index.ts : io.on] Disconnecting idle client with socket Id:', socket.id);
		userManager.removeUser(socket.id);
		socket.disconnect(true);

	}, IDLE_TIMEOUT);

	// Reset the timeout whenever the client sends any data
	socket.on('keepAlive', (data) => {

		clearTimeout(idleTimeout);

		idleTimeout = setTimeout(() => {

			console.log('[Index.ts : io.on] Disconnecting idle client with socket Id:', socket.id);
			userManager.removeUser(socket.id);
			socket.disconnect(true);
			
		}, IDLE_TIMEOUT);
	});

	console.log('[Index.ts : io.on] A user connected', socket.handshake.query['name']);
	userManager.addUser(socket.handshake.query['name'] as string, socket);
	
	socket.on("disconnect", () => {
		console.log("[Index.ts : Socket.on.Disconnect] User disconnected");
		userManager.removeUser(socket.id);
		socket.disconnect(true);
	})
	
	socket.on("leave", () => {
		console.log("[Index.ts : Socket.on.Leave] User disconnected");
		userManager.removeUser(socket.id);
		socket.disconnect(true);
	})

	socket.on("skip", () => {
		console.log("[Index.ts : Socket.on.Skip] User disconnected");
		// remove room
		userManager.userLeft(socket.id);
	})
});

server.listen(3000, () => {
	console.log('[Index.ts : Listen]listening on *:3000');
});