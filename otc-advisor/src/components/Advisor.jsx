import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { symptoms } from '../data/otcData';

function Advisor() {
  const [selected, setSelected] = useState([]);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selected.length === 0) {
      setError('Please select at least one symptom.');
      return;
    }
    setError('');
    navigate('/results', {
      state: { symptoms: selected, reference: reference.trim() },
    });
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body className="p-4">
        <h2 className="mb-3">Symptom checker</h2>
        <p className="text-muted">
          Select the symptoms you have, add an optional reference note, then get
          OTC recommendations.
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Symptoms</Form.Label>
            <Row>
              {symptoms.map((s) => (
                <Col xs={12} sm={6} key={s.id}>
                  <Form.Check
                    type="checkbox"
                    id={`sym-${s.id}`}
                    label={s.label}
                    className="symptom-check mb-2"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                  />
                </Col>
              ))}
            </Row>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">
              Reference / note (optional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="e.g. patient is 30y adult, no allergies, mild fever since morning"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <Form.Text muted>
              Context you want to keep alongside the recommendation.
            </Form.Text>
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" variant="primary" size="lg">
            Recommend OTC drugs →
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default Advisor;
