import { useEffect, useState } from "react"

import Form from "./JoiningForm";
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
			<Form name={name} setName={setName} darkMode={darkMode} toggleDarkMode={toggleDarkMode} setJoined={setJoined}></Form>
        );
    }

    return <Room joined={joined} name={name} setJoined={setJoined} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
}