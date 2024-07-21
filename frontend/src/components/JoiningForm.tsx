import { Navbar } from "./Navbar";
import { useState } from "react";

const Form = function ({ name, setName, darkMode, toggleDarkMode, setJoined }) {
	const [error, setError] = useState('');

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

	return (
		<div className={`flex flex-col h-screen ${darkMode ? 'bg-black text-white' : 'bg-gray-200 text-gray-800'}`}>
			<Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} name={""} />
			<div id="joining-form" className="flex flex-col items-center justify-center flex-grow">
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
			</div>
		</div>
	);
}

export default Form;