const VideoChat = ({ lobby, localVideoRef, remoteVideoRef, handleLeave, socket, setJoined, darkMode }) => {
	return (
		<div id="VideoChat" className="w-1/2 flex-1 flex flex-col ml-32 mt-6">
			<div className="w-3/4">
				<video className="rounded-sm" autoPlay width={350} height={240} ref={localVideoRef} />
				{lobby && <p className="text-sm">Waiting to connect you to someone</p>}
				<video className="rounded-sm my-2" autoPlay width={350} height={240} ref={remoteVideoRef} />
			</div>
			<div className="flex mt-4">
					<button onClick={() => {
						handleLeave(false);
						socket.emit("leave");
					}} className={`px-4 py-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-600'} ${darkMode ? 'text-white' : 'text-white'} text-white rounded-md mr-4 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-700'}`}>Skip</button>
					<button onClick={() => {
						handleLeave(true);
						socket.emit("close");
						setJoined(false);
					}} className={`px-4 py-2 ${darkMode ? 'bg-red-500' : 'bg-red-600'} text-white rounded-md ${darkMode ? 'hover:bg-red-600' : 'hover:bg-red-700'}`}>Leave</button>
				</div>
		</div>
	)
}

export default VideoChat;