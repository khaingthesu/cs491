import { Lottie } from 'lottie-react';
import { useState } from 'react';
import { Badge, Button, Card, Container } from 'react-bootstrap';
import welcomeAnimation from '../assets/welcome.json';
import './Home.css';

function Home() {
    const [info, setInfo] = useState("WELCOME TO Home Page");

    return (
        <Container className="home-container py-5">
            <Card className="home-card text-center shadow-lg">
                <Card.Body>
                    <Badge bg="primary" className="mb-3">
                        React Router Demo
                    </Badge>

                    <div className="animation-container" aria-hidden="true">
                        <Lottie
                            src={welcomeAnimation}
                            loop
                            autoplay
                            style={{ width: '100%', height: '100%' }}
                        />
                    </div>

                    <Card.Title as="h1" id="info">
                        {info}
                    </Card.Title>

                    <Card.Text>
                        Welcome to my React application! Explore Bootstrap
                        components and Lottie animations.
                    </Card.Text>

                    <Button
                        variant="primary"
                        className="me-2"
                        type="button"
                        onClick={() => setInfo("Hello from React!")}
                    >
                        Click Me
                    </Button>

                    <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setInfo("WELCOME TO REACT ROUTER DEMO")}
                    >
                        Reset
                    </Button>

                </Card.Body>

            </Card>
        </Container>
    );
}

export default Home;