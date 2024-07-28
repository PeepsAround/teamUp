import { Server } from 'socket.io';
import { Socket } from "socket.io";
import { UserManager } from './managers/UserManger';
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app); // Pass the `app` instance here

const io = new Server(server, {
	cors: {
		origin: "*"
	}
});

const getTime = () => {
	const timestamp = new Date().getTime();
	const date = new Date(timestamp);
	const humanReadableDate = date.toUTCString();
	return "["+ humanReadableDate +"] : ";
}

const userManager = new UserManager();

io.on('connection', (socket: Socket) => {

	const IDLE_TIMEOUT = 11000;
	// Initialize a timeout for the client
	let idleTimeout = setTimeout(() => {
		
		console.log(getTime() +'[Index.ts : io.on] Disconnecting idle client with socket Id:', socket.id);
		userManager.removeUser(socket.id);
		socket.disconnect(true);

	}, IDLE_TIMEOUT);

	// Reset the timeout whenever the client sends any data
	socket.on('keepAlive', (data) => {

		clearTimeout(idleTimeout);

		idleTimeout = setTimeout(() => {

			console.log(getTime() +'[Index.ts : io.on] Disconnecting idle client with socket Id:', socket.id);
			userManager.removeUser(socket.id);
			socket.disconnect(true);
			
		}, IDLE_TIMEOUT);
	});

	console.log(getTime() +'[Index.ts : io.on] A user connected', socket.handshake.query['name']);
	userManager.addUser(socket.handshake.query['name'] as string, socket);
	
	socket.on("disconnect", () => {
		console.log(getTime() +"[Index.ts : Socket.on.Disconnect] User disconnected : " + userManager.getUserFromSocketId(socket.id) + " disconnected");
		userManager.removeUser(socket.id);
		socket.disconnect(true);
	});
	
	socket.on("leave", () => {
		console.log(getTime() +"[Index.ts : Socket.on.Leave] User left : " + userManager.getUserFromSocketId(socket.id) + " disconnected");
		userManager.removeUser(socket.id);
		socket.disconnect(true);
	});

	socket.on("skip", () => {
		console.log(getTime() +"[Index.ts : Socket.on.Skip] User skipped " + userManager.getUserFromSocketId(socket.id) + " disconnected");
		// remove room
		userManager.userLeft(socket.id);
	});
});

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*"); // Allow any origin
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
	next();
  });

app.get('/getLiveUsers', (req, res) => {
	const now = new Date();
	var currentMinute = now.getMinutes();
	currentMinute = 10 - (currentMinute % 10);
	currentMinute += 20;
	currentMinute += userManager.getcount()
    res.send(currentMinute.toString()); // Ensure the count is sent as a string
});

server.listen(3000, () => {
	console.log(getTime() +'[Index.ts : Listen]listening on *:3000');
});