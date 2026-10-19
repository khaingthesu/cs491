import { Alert, Card } from 'react-bootstrap';

function About() {
  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <h2 className="mb-3">About</h2>
        <p>
          OTC Advisor is a small React + Vite demo that maps common symptoms to
          over-the-counter medicine options with general adult dosing references.
          Each recommendation lists the reference source it was drawn from.
        </p>
        <h5 className="mt-4">How it works</h5>
        <ol>
          <li>Pick one or more symptoms on the Advisor page.</li>
          <li>The app matches them against a static OTC reference dataset.</li>
          <li>You get a list of drugs, adult doses, notes, and references.</li>
        </ol>
        <Alert variant="warning" className="mt-4 mb-0">
          <strong>Medical disclaimer:</strong> Dosing depends on age, weight,
          allergies, pregnancy, other medications, and health conditions. This
          app is for educational purposes only. Always read the product label
          and consult a pharmacist or doctor.
        </Alert>
      </Card.Body>
    </Card>
  );
}

export default About;
