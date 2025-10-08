import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import IssuancePage from './pages/IssuancePage';
import VerificationPage from './pages/VerificationPage';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1>🔐 Kube Credential</h1>
            <p>Secure Credential Issuance and Verification System</p>
          </div>
        </header>

        <nav className="nav">
          <div className="nav-content">
            <NavLink to="/" className="nav-link" end>
              Issue Credential
            </NavLink>
            <NavLink to="/verify" className="nav-link">
              Verify Credential
            </NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<IssuancePage />} />
            <Route path="/verify" element={<VerificationPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;



