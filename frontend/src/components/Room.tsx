import { Socket, io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

import { Navbar } from "./Navbar";
import TextChat from "./TextChat";
import Vapi from "@vapi-ai/web";
import VideoChat from "./VideoChat";

var URL = "https://3t0aippcm8.execute-api.ap-south-1.amazonaws.com";


export const Room = ({
	name,
	joined,
	setJoined,
	darkMode,
	toggleDarkMode
}: {
	name: string,
	joined: boolean,
	setJoined: React.Dispatch<React.SetStateAction<boolean>>,
	darkMode: boolean,
	toggleDarkMode: () => void
}) => {
	const [lobby, setLobby] = useState(true);
	const [tracksLoaded, setTracksLoaded] = useState(false);
	const [activeTab, setActiveTab] = useState('video');

	// Socket
	const [socket, setSocket] = useState<null | Socket>(null);

	// Peer channels
	const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
	const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);

	// Remote MediaStreamTrack
	const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
	const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);

	// MediaStream
	const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);

	// RTCDatachannel
	const [sendingDc, setSendingDc] = useState<RTCDataChannel | null>(null);
	const [receivingDc, setReceivingDc] = useState<RTCDataChannel | null>(null);

	// Local MediaStreamTrack
	const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
	const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);

	// Video element ref
	var localVideoRef = useRef<HTMLVideoElement>(null);
	const remoteVideoRef = useRef<HTMLVideoElement>(null);

	// Text chat
	const [chat, setChat] = useState<string>("");
	const [chatMessages, setChatMessages] = useState<string[][]>([]);
	const [partnerName, setPartnerName] = useState<string>("");
	const [vapi, setVapi] = useState<Vapi>(null);

	// Keep video elements persistent
	const localVideoElement = useRef(null);
	const remoteVideoElement = useRef(null);

	const [showAIPopup, setShowAIPopup] = useState(false);

	const startAIInteraction = () => {
		setVapi((prevVapi) => {
			const newVapi = new Vapi("07fdacfa-e69d-44dc-8999-fc4f6e1024bb");
			newVapi.start("83f508c6-c045-4d7f-b313-b06b463935f0");
			return newVapi;
		});

		// Play the video in remote video elements
		const videoUrl = "https://static.vecteezy.com/system/resources/previews/022/413/348/mp4/artificial-intelligence-animation-sound-of-assistant-free-video.mp4";

		if (remoteVideoRef.current) {
			remoteVideoRef.current.src = videoUrl;
			remoteVideoRef.current.loop = true; // Set loop to true
			remoteVideoRef.current.play();
		}

		if (remoteVideoElement.current) {
			remoteVideoElement.current.src = videoUrl;
			remoteVideoElement.current.loop = true; // Set loop to true
			remoteVideoElement.current.play();
		}

		setLobby(false);

		setPartnerName("Start-Up Mentor AI, Say Hi");
		setShowAIPopup(true);

		// Close any established connections
		socket.emit("withAI");
	};

	useEffect(() => {
		if (tracksLoaded) {
			const connectionTimeout = setTimeout(() => {
				if (lobby && socket && vapi == null) {
					startAIInteraction();
				}
			}, 5000);

			return () => clearTimeout(connectionTimeout);
		}
	}, [socket, lobby]);


	async function handleLeave(doStopCam) {
		if(vapi != null){
			await vapi.say("Thanks, Bye Bye", true)
			await vapi.stop();
			setVapi(null);
		}
		if (doStopCam) stopCam();
		if (remoteVideoRef.current) {
			remoteVideoRef.current.srcObject = null;
		}
		if (remoteVideoElement.current) {
			remoteVideoElement.current.srcObject = null;
		}

		if (remoteVideoRef.current) {
			remoteVideoRef.current.pause();
			remoteVideoRef.current.removeAttribute('src');
			remoteVideoRef.current.loop = false;
			remoteVideoRef.current.load();
			remoteVideoRef.current.removeAttribute('poster');
		}
		
		if (remoteVideoElement.current) {
			remoteVideoElement.current.pause();
			remoteVideoElement.current.removeAttribute('src');
			remoteVideoElement.current.loop = false;
			remoteVideoElement.current.load();
			remoteVideoElement.current.removeAttribute('poster');
		}
		

		setLobby(true);
		setPartnerName(null);
		sendingPc?.close();
		setSendingPc(pc => {
			if (pc) {
				pc.onicecandidate = null;
				pc.onnegotiationneeded = null;
			}

			return pc;
		})
		receivingPc?.close();
		setReceivingPc(pc => {
			if (pc) {
				pc.onicecandidate = null;
				pc.ontrack = null;
			}

			return pc;
		})
		setPartnerName(null);
	}

	const stopCam = () => {
		if (localAudioTrack) {
			localAudioTrack.stop();
		}
		if (localVideoTrack) {
			localVideoTrack.stop();
		}
		if (localVideoRef.current && localVideoRef.current.srcObject) {
			//@ts-ignore
			const tracks = localVideoRef.current.srcObject.getTracks();
			tracks.forEach(track => track.stop());
			localVideoRef.current.srcObject = null;
		}

		navigator.mediaDevices.getUserMedia({ audio: true, video: true })
			.then(stream => {
				stream.getTracks().forEach(track => track.stop());
			})
		//.catch(error => console.error("Error accessing media devices.", error));
	};

	const getCam = async () => {
		const stream = await window.navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		})
		// MediaStream
		const audioTrack = stream.getAudioTracks()[0]
		const videoTrack = stream.getVideoTracks()[0]
		setLocalAudioTrack(audioTrack);
		setlocalVideoTrack(videoTrack);
		if (!localVideoRef.current) {
			return;
		}
		localVideoRef.current.srcObject = new MediaStream([videoTrack])
		localVideoRef.current.play();

		localVideoElement.current.srcObject = new MediaStream([videoTrack])
		localVideoElement.current.play();
		// MediaStream

		setTracksLoaded(true);
	}

	useEffect(() => {
		getCam();
	}, [])

	useEffect(() => {
		if (tracksLoaded) {
			const socket = io(URL, {
				query: {
					"name": name
				}
			});

			socket.on("lobby", () => {
				setLobby(true);
			})

			socket.on('send-offer', async ({ roomId }: { roomId: string }) => {
				setLobby(false);
				const pc = new RTCPeerConnection();

				if (localVideoTrack) {
					pc.addTrack(localVideoTrack)
				}
				if (localAudioTrack) {
					pc.addTrack(localAudioTrack)
				}

				pc.onicecandidate = async (e) => {
					if (e.candidate) {
						socket.emit("add-ice-candidate", {
							candidate: e.candidate,
							type: "sender",
							roomId
						})
					}
				}

				pc.onnegotiationneeded = async () => {
					const sdp = await pc.createOffer();
					//@ts-expect-ignore
					pc.setLocalDescription(sdp)
					socket.emit("offer", {
						sdp,
						roomId
					})
				}
				const dc = pc.createDataChannel("chat", { negotiated: true, id: 0 });
				setSendingDc(dc);
				setSendingPc(pc);
			});

			socket.on("offer", async ({ roomId, sdp: remoteSdp, partnerName }) => {
				setPartnerName(partnerName);
				setLobby(false);
				const pc = new RTCPeerConnection();

				const stream = new MediaStream();
				setRemoteMediaStream(stream)
				if (remoteVideoRef.current) {
					remoteVideoRef.current.srcObject = stream;
				}

				if (remoteVideoElement.current) {
					remoteVideoElement.current.srcObject = stream;
				}

				pc.ontrack = (e) => {
					//console.error("inside ontrack");
					const { track, type } = e;
					if (type == 'audio') {
						setRemoteAudioTrack(track);
						// @ts-ignore
						remoteVideoRef.current.srcObject.addTrack(track);
					} else {
						setRemoteVideoTrack(track);
						// @ts-ignore
						remoteVideoRef.current.srcObject.addTrack(track);
						remoteVideoElement.current.srcObject.addTrack(track);
					}
					//@ts-ignore
					remoteVideoRef.current.play();
					remoteVideoElement.current.play();
				}

				pc.onicecandidate = async (e) => {
					if (!e.candidate) {
						return;
					}
					if (e.candidate) {
						socket.emit("add-ice-candidate", {
							candidate: e.candidate,
							type: "receiver",
							roomId
						})
					}
				}
				const dc = pc.createDataChannel("chat", { negotiated: true, id: 0 });
				dc.onmessage = (e) => {
					setChatMessages(prevMessages => [[partnerName, e.data], ...prevMessages]);
				}
				dc.onclose = function () {
					setChatMessages([]);
				};

				pc.setRemoteDescription(remoteSdp)
				const sdp = await pc.createAnswer();
				pc.setLocalDescription(sdp)
				setReceivingDc(dc);
				setReceivingPc(pc);

				socket.emit("answer", {
					roomId,
					sdp: sdp
				});
			});

			socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
				setLobby(false);
				setSendingPc(pc => {
					pc?.setRemoteDescription(remoteSdp)
					return pc;
				});
			})

			socket.on("add-ice-candidate", ({ candidate, type }) => {
				if (type == "sender") {
					setReceivingPc(pc => {
						if (!pc) {
							//console.error("receicng pc nout found")
						} else {
							//console.error(pc.ontrack)
						}
						pc?.addIceCandidate(candidate)
						return pc;
					});
				} else {
					setSendingPc(pc => {
						if (!pc) {
							//console.error("sending pc nout found")
						} else {
							// console.error(pc.ontrack)
						}
						pc?.addIceCandidate(candidate)
						return pc;
					});
				}
			});

			socket.on("skip", () => {
				handleLeave(false);
			})

			const keepAliveInterval = setInterval(() => {
				if (socket.connected) { // Check if the socket is connected
					socket.emit('keepAlive', { message: 'keep-alive' });
				} else {
					// Clear the interval if the socket is not connected
					clearInterval(keepAliveInterval);
				}
			}, 10000);

			// Handle disconnection or cleanup
			socket.on('disconnect', () => {
				// Clear the interval when the socket is disconnected
				// clearInterval(keepAliveInterval);
			});

			console.log("socket created");
			setSocket(socket);
		}

	}, [tracksLoaded])

	// useEffect(() => {
	//     if (localVideoRef.current) {
	//         if (localVideoTrack) {
	//             localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
	//             localVideoRef.current.play();
	//         }
	//     }
	// }, [localVideoRef])

	return (
		<div className={`flex min-h-screen flex-col ${darkMode ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>
			<Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} name={name} />
			{showAIPopup && (
				<div className="fixed inset-0 flex items-center justify-center z-50">
					{/* Semi-transparent overlay */}
					<div className="absolute inset-0 bg-black opacity-50"></div>

					{/* Popup content */}
					<div className={`relative bg-${darkMode ? 'gray-800' : 'white'} p-6 rounded-lg shadow-lg max-w-sm w-full mx-4`}>
						<p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
							No one seems to be free, Peering you up with AI.
						</p>
						<button
							className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300`}
							onClick={() => setShowAIPopup(false)}
						>
							Got it!
						</button>
					</div>
				</div>
			)}
			<div className={`bg-${darkMode ? 'bg-black' : 'gray-200'} text-${darkMode ? 'white' : 'black'} py-5`}>
				<div className="flex flex-col lg:flex-row w-full">
					<div className="hidden lg:flex w-full">
						{/* Left Part for larger screens */}
						<VideoChat
							lobby={lobby}
							localVideoRef={localVideoRef}
							remoteVideoRef={remoteVideoRef}
							handleLeave={handleLeave}
							socket={socket}
							setJoined={setJoined}
							darkMode={darkMode}
						/>
						{/* Right Part for larger screens */}
						<TextChat
							partnerName={partnerName}
							chatMessages={chatMessages}
							sendingDc={sendingDc}
							chat={chat}
							setChatMessages={setChatMessages}
							setChat={setChat}
							darkMode={darkMode}
						/>
					</div>
					<div className="lg:hidden w-full">
						{/* Tab Navigation for mobile screens */}
						<div className="flex justify-around p-2 mx-32 gap-2">
							<button
								className={`flex-1 p-2 rounded-md ${activeTab === 'video' ? darkMode ? 'bg-gray-700' : 'bg-gray-100' : ''}`}
								onClick={() => setActiveTab('video')}
							>
								Video
							</button>
							<button
								className={`flex-1 p-2 rounded-md ${activeTab === 'text' ? darkMode ? 'bg-gray-700' : 'bg-gray-100' : ''}`}
								onClick={() => setActiveTab('text')}
							>
								Chat
							</button>
						</div>
						{/* Content based on active tab */}
						<div className={activeTab === 'video' ? 'block' : 'hidden'}>
							<VideoChat
								lobby={lobby}
								localVideoRef={localVideoElement}
								remoteVideoRef={remoteVideoElement}
								handleLeave={handleLeave}
								socket={socket}
								setJoined={setJoined}
								darkMode={darkMode}
							/>
						</div>
						<div className={activeTab === 'text' ? 'block' : 'hidden'}>
							<TextChat
								partnerName={partnerName}
								chatMessages={chatMessages}
								sendingDc={sendingDc}
								chat={chat}
								setChatMessages={setChatMessages}
								setChat={setChat}
								darkMode={darkMode}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}