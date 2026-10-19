import { Badge, Card, Container } from 'react-bootstrap';
import './About.css';

function About() {
    return (
        <Container className="about-container py-5">
            <Card className="about-card shadow-lg">
                <Card.Body>
                    <Badge bg="secondary" className="mb-3">
                        About
                    </Badge>

                    <Card.Title as="h1">About This App</Card.Title>

                    <Card.Text>
                        This is a simple React Router demo built with React,
                        React Bootstrap, and Lottie animations. It shows how to
                        navigate between pages without reloading the browser.
                    </Card.Text>

                   
                </Card.Body>
            </Card>
        </Container>
    );
}

export default About;
