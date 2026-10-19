import { lazy, Suspense } from 'react';
import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Lazy-load the Lottie player so the heavy lottie-web bundle is only fetched
// when this page renders, instead of at startup.
const PulseLottie = lazy(() => import('./PulseLottie'));

function Home() {
  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="text-center p-5">
        <Badge bg="primary" className="mb-3">
        Medicare 
        </Badge>

        <div
          className="lottie-wrap d-flex justify-content-center align-items-center"
          style={{ height: 180 }}
          aria-hidden="true"
        >
          <Suspense fallback={<Spinner animation="border" variant="primary" />}>
            <PulseLottie />
          </Suspense>
        </div>

        <h1 className="mb-3">OTC Advisor</h1>
        <p className="lead text-muted">
          Enter your symptoms and get general over-the-counter (OTC) medicine
          and dosage references.
        </p>
        <Button as={Link} to="/advisor" variant="primary" size="lg" className="mt-3">
          Start →
        </Button>
        <p className="text-muted mt-4 mb-0" style={{ fontSize: '0.85rem' }}>
          This tool is for learning purposes only and does not replace
          professional medical advice.
        </p>
      </Card.Body>
    </Card>
  );
}

export default Home;
