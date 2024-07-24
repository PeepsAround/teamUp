const VideoChat = ({ lobby, localVideoRef, remoteVideoRef, handleLeave, socket, setJoined, darkMode }) => {
	return (
		<div id="VideoChat" className="w-full lg:w-1/2 flex flex-col mt-6 lg:ml-32">
			<div className="w-full lg:w-3/4">
				<video className="rounded-sm max-h-64" autoPlay width="100%" height="auto" ref={localVideoRef} />
				{lobby && <div className="w-full"><p className="text-sm text-center">Wait, Connecting you with someone!</p></div>}
				<video className="rounded-sm max-h-64 my-2" autoPlay width="100%" height="auto" ref={remoteVideoRef} />
				<div className="flex mt-4 justify-center">
					<button
						onClick={() => {
							handleLeave(false);
							socket.emit("leave");
						}}
						className={`px-4 py-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-600'} text-white rounded-md mr-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-700'}`}
					>
						Skip
					</button>
					<button
						onClick={() => {
							handleLeave(true);
							socket.emit("close");
							setJoined(false);
						}}
						className={`px-4 py-2 ${darkMode ? 'bg-red-500' : 'bg-red-600'} text-white rounded-md ${darkMode ? 'hover:bg-red-600' : 'hover:bg-red-700'}`}
					>
						Leave
					</button>
				</div>
			</div>
		</div>
	);
}

export default VideoChat;