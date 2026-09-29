import { useState } from 'react';
import './About.css';


function About() {
    const [info, setInfo] = useState("This is About Page");
    const [name, setName] = useState("John");
    return (
        <div id="about">
            <p id="info">{info}</p>
            <p>Name: {name}</p>
        </div>
    )
};

export default About;