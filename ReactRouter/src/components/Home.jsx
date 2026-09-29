import { useState } from 'react';
import './Home.css';
function Home() {
    const [info, setInfo] = useState("WELCOME TO REACT ROUTER DEMO");
    return (
        <div id="header">
            <p id="info">{info}</p>
        </div>
    )
};

export default Home;