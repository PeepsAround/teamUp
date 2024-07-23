const TextChat = ({ partnerName, chatMessages, sendingDc, chat, setChatMessages, setChat, darkMode }) => {
	const handleSendMessage = () => {
		if (sendingDc && chat.trim() !== "") {
			setChatMessages(prevMessages => [["You", chat], ...prevMessages]);
			sendingDc.send(chat);
			setChat('');
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleSendMessage();
		}
	};

	return (
		<div id="Textchat" className="flex-1 flex flex-col mx-10 lg:mr-32 mt-4 lg:mt-0">
			<div className="w-full text-left">{partnerName ? `You are now chatting with ${partnerName}` : "Finding someone!"}</div>
			<div className={`w-full bg-${darkMode ? 'gray-700' : 'white'} p-4 rounded-lg shadow-md h-[540px] overflow-y-auto flex flex-col-reverse`}>
				{chatMessages.map((message, index) => (
					<div key={index} className={`flex flex-col ${message[0] === "You" ? 'items-end' : 'items-start'} mb-4`}>
						<div className={`${message[0] === "You" ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-900'} rounded-md p-2 max-w-64 break-words min-w-16`}>
							{message[1]}
						</div>
						<div className="text-xs">{message[0]}</div>
					</div>
				))}
			</div>
			<div className="mt-4 w-full flex flex-row gap-2">
				<div className="w-[80%]">
					<input
						value={chat}
						placeholder="Message"
						onChange={(e) => setChat(e.target.value)}
						onKeyDown={handleKeyDown}
						type="text"
						className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-700 text-white bg-gray-700' : 'border-gray-300 bg-white'} rounded-md focus:outline-none`}
					/>
				</div>
				<div className="w-[20%]">
					<button
						onClick={handleSendMessage}
						className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-600'} text-white rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-700'}`}
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
};

export default TextChat;