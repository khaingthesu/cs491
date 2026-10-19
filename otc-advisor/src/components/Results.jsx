import { Alert, Badge, Button, Card, ListGroup } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { getRecommendations, getSymptomLabel } from '../data/otcData';

function Results() {
  const location = useLocation();
  const state = location.state || {};
  const selectedSymptoms = state.symptoms || [];
  const reference = state.reference || '';

  if (selectedSymptoms.length === 0) {
    return (
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4 text-center">
          <h2 className="mb-3">No symptoms selected</h2>
          <p className="text-muted">Head back and pick your symptoms first.</p>
          <Button as={Link} to="/advisor" variant="primary">
            Go to Advisor
          </Button>
        </Card.Body>
      </Card>
    );
  }

  const results = getRecommendations(selectedSymptoms);

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <h2 className="mb-3">Recommended OTC options</h2>

        <div className="mb-3">
          <span className="fw-semibold me-2">Symptoms:</span>
          {selectedSymptoms.map((id) => (
            <Badge bg="secondary" className="me-1" key={id}>
              {getSymptomLabel(id)}
            </Badge>
          ))}
        </div>

        {reference && (
          <Alert variant="light" className="border">
            <strong>Reference note:</strong> {reference}
          </Alert>
        )}

        {results.length === 0 ? (
          <Alert variant="info">No OTC entries found for these symptoms.</Alert>
        ) : (
          results.map((rec, i) => (
            <Card className="mb-3" key={`${rec.symptomId}-${rec.drug}-${i}`}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">{rec.drug}</span>
                <Badge bg="primary">{getSymptomLabel(rec.symptomId)}</Badge>
              </Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Adult dose:</strong> {rec.adultDose}
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Notes:</strong> {rec.notes}
                </ListGroup.Item>
                <ListGroup.Item className="text-muted" style={{ fontSize: '0.85rem' }}>
                  <strong>Reference:</strong> {rec.reference}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          ))
        )}

        <Alert variant="warning" className="mt-3">
          <strong>Important:</strong> Doses shown are general adult references.
          They are not personalized. Confirm with the product label and a
          pharmacist or doctor before use.
        </Alert>

        <Button as={Link} to="/advisor" variant="outline-primary">
          ← Check other symptoms
        </Button>
      </Card.Body>
    </Card>
  );
}

export default Results;
