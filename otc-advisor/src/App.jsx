import { Container, Nav, Navbar } from 'react-bootstrap';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import About from './components/About';
import Advisor from './components/Advisor';
import Home from './components/Home';
import Results from './components/Results';

function App() {
  return (
    <BrowserRouter>
      <Navbar bg="primary" variant="dark" expand="md">
        <Container>
          <Navbar.Brand as={Link} to="/">💊 OTC Advisor</Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/advisor">Advisor</Nav.Link>
              <Nav.Link as={Link} to="/about">About</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="my-4" style={{ maxWidth: 820 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advisor" element={<Advisor />} />
          <Route path="/results" element={<Results />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Container>

      <Container className="app-footer text-center pb-4" style={{ maxWidth: 820 }}>
        <hr />
        Educational demo only — not medical advice. Always consult a pharmacist
        or doctor before taking any medication.
      </Container>
    </BrowserRouter>
  );
}

export default App;
