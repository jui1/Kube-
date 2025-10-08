import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import VerificationPage from './VerificationPage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VerificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the verification form', () => {
    render(<VerificationPage />);
    expect(screen.getByText(/Verify Credential/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Credential ID/i)).toBeInTheDocument();
  });

  it('verifies a valid credential', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        verified: true,
        message: 'Credential is valid',
        workerId: 'worker-1',
        timestamp: '2025-10-07T10:00:00Z',
        issuedBy: 'worker-1',
        issuedAt: '2025-10-07T09:00:00Z'
      }
    });

    render(<VerificationPage />);
    
    fireEvent.change(screen.getByLabelText(/Credential ID/i), { 
      target: { value: 'TEST-001' } 
    });
    fireEvent.change(screen.getByLabelText(/Holder Name/i), { 
      target: { value: 'Test User' } 
    });
    fireEvent.change(screen.getByLabelText(/Credential Type/i), { 
      target: { value: 'Test' } 
    });
    fireEvent.change(screen.getByLabelText(/Issued Date/i), { 
      target: { value: '2025-10-07' } 
    });

    const submitButton = screen.getByText(/Verify Credential/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Credential Verified/i)).toBeInTheDocument();
      expect(screen.getByText(/VALID/i)).toBeInTheDocument();
    });
  });

  it('shows invalid for non-existent credential', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        verified: false,
        message: 'Credential not found',
        workerId: 'worker-1',
        timestamp: '2025-10-07T10:00:00Z'
      }
    });

    render(<VerificationPage />);
    
    fireEvent.change(screen.getByLabelText(/Credential ID/i), { 
      target: { value: 'FAKE-001' } 
    });
    fireEvent.change(screen.getByLabelText(/Holder Name/i), { 
      target: { value: 'Fake User' } 
    });
    fireEvent.change(screen.getByLabelText(/Credential Type/i), { 
      target: { value: 'Fake' } 
    });
    fireEvent.change(screen.getByLabelText(/Issued Date/i), { 
      target: { value: '2025-10-07' } 
    });

    const submitButton = screen.getByText(/Verify Credential/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Verification Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/INVALID/i)).toBeInTheDocument();
    });
  });
});



