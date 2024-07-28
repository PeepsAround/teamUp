import { Navbar } from "./Navbar";
import axios from 'axios';
import { useState } from "react";

const Form = function ({ name, setName, darkMode, toggleDarkMode, setJoined }) {
	const [error, setError] = useState('');
	const [userCount, setUserCount] = useState(0);

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			handleJoinClick();
		}
	};

	const handleJoinClick = () => {
		if (name.trim() !== '') {
			setError('');
			setJoined(true);
		} else {
			setError('Please enter your name');
		}
	};

	const fetchUserCount = async () => {
		try {
			const response = await axios.get('https://3t0aippcm8.execute-api.ap-south-1.amazonaws.com/getLiveUsers');
			setUserCount(response.data);
		} catch (error) {
			//console.error('Error fetching the user count:', error);
		}
	};
	fetchUserCount();

	return (
		<div className={`flex min-h-screen flex-col ${darkMode ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>
			<Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} name={""} />
			<div id="joining-form" className="text-center mt-20 flex flex-col items-center lg:mt-30">
				<div className={`max-w-screen-md mx-auto items-center ${darkMode ? 'bg-black text-white' : 'bg-gray-200 text-black'} dark:text-white p-4`}>
					<div className={`text-center ${darkMode ? 'text-white' : 'text-black'}`}>
						<h1 className="text-6xl mb-2 lg:text-8xl">
							Real-Time Networking
						</h1>
					</div>
					<br/>
					<div className="mb-4 mx-16">
						<p className={` text-xl lg:text-2xl ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
							Instantly network with like-minded entrepreneurs. Share ideas, find mentors, and collaborate on projects to drive your venture forward.
						</p>
					</div>
				</div>
				<div id="name-field" className="flex flex-col items-center">
					<input
						type="text"
						placeholder="Enter your name"
						className={`w-80 px-4 py-2 border ${darkMode ? 'border-gray-700 text-white bg-gray-700' : 'border-gray-300 bg-white'} rounded-lg focus:outline-none`}
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					{error && <span className="text-red-500 mt-2">{error}</span>}
				</div>
				<div id="start-button">
					<button
						className={`mt-4 px-6 py-2 ${darkMode ? 'bg-white' : 'bg-black'}  ${darkMode ? 'text-black' : 'text-white'} rounded-lg hover:${darkMode ? 'bg-gray-200' : 'bg-gray-700'} focus:outline-none flex items-center justify-center`}
						onClick={handleJoinClick}
					>
						Join
						<svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</button>
				</div>
				<div className="mt-3 mx-36 text-gray-400">
					<p>Join to get on a video call</p>
				</div>
			</div>
		</div>
	);
}

export default Form;