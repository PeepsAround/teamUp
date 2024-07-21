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
		<div id="Textchat" className="flex-1 flex flex-col mr-32">
			<div className=" w-full text-left">{partnerName ? `You are now chatting with ${partnerName}` : "Finding someone!"}</div>
			<div className={`w-full bg-${darkMode ? 'gray-700' : 'white'} p-4 rounded-lg shadow-md h-[540px] overflow-y-auto flex flex-col-reverse`}>
				{chatMessages.map((message, index) => {
					if (message[0] === "You") {
						return (
							<div key={index} className="flex flex-col items-end mb-4">
								<div className="bg-blue-500 rounded-md p-2 text-white max-w-64 break-words min-w-16">
									{message[1]}
								</div>
								<div className="text-xs">{message[0]}</div>
							</div>
						);
					} else {
						return (
							<div key={index} className="flex flex-col items-start mb-4">
								<div className={`bg-${darkMode ? 'gray-200' : 'white'} rounded-md p-2 text-gray-900 max-w-64 break-words min-w-16`}>
									{message[1]}
								</div>
								<div className="text-xs">{message[0]}</div>
							</div>
						);
					}
				})}
			</div>
			<div className="mt-4 w-full flex flex-row gap-2">
				<div className="w-5/6">
					<input
						value={chat}
						placeholder="Message"
						onChange={(e) => setChat(e.target.value)}
						onKeyDown={handleKeyDown}
						type="text"
						className={`w-full px-4 py-2 border ${darkMode ? 'border-gray-700 text-white bg-gray-700' : 'border-gray-300 bg-white'} rounded-md focus:outline-none`}
					/>
				</div>
				<div className="w-1/6">
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