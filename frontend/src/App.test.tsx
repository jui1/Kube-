import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the header', () => {
    render(<App />);
    expect(screen.getByText(/Kube Credential/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<App />);
    expect(screen.getByText(/Issue Credential/i)).toBeInTheDocument();
    expect(screen.getByText(/Verify Credential/i)).toBeInTheDocument();
  });

  it('renders issuance page by default', () => {
    render(<App />);
    expect(screen.getByText(/Create and issue a new credential/i)).toBeInTheDocument();
  });
});



