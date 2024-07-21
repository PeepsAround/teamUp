import { useEffect, useState } from "react"

import Lobby from "./Lobby";
import { Room } from "./Room";

export const Homepage = () => {
    const [name, setName] = useState("");
    const [darkMode, setDarkMode] = useState(false);

    const [joined, setJoined] = useState(false);



    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleSystemDarkModeChange = (event: MediaQueryListEvent) => {
        setDarkMode(event.matches);
    };

    useEffect(() => {
        const systemDarkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setDarkMode(systemDarkModeQuery.matches);

        systemDarkModeQuery.addEventListener('change', handleSystemDarkModeChange);

        return () => {
            systemDarkModeQuery.removeEventListener('change', handleSystemDarkModeChange);
        };
    }, []);

    if (!joined) {
            
        return (
			<Lobby name={name} setName={setName} darkMode={darkMode} toggleDarkMode={toggleDarkMode} setJoined={setJoined}></Lobby>
        );
    }

    return <Room joined={joined} name={name} setJoined={setJoined} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
}