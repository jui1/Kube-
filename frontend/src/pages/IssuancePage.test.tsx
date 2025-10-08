import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import IssuancePage from './IssuancePage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IssuancePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the issuance form', () => {
    render(<IssuancePage />);
    expect(screen.getByText(/Issue Credential/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Credential ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Holder Name/i)).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(<IssuancePage />);
    const idInput = screen.getByLabelText(/Credential ID/i) as HTMLInputElement;
    
    fireEvent.change(idInput, { target: { value: 'TEST-001' } });
    expect(idInput.value).toBe('TEST-001');
  });

  it('submits the form successfully', async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        success: true,
        message: 'Credential issued by worker-1',
        workerId: 'worker-1',
        timestamp: '2025-10-07T10:00:00Z'
      }
    });

    render(<IssuancePage />);
    
    fireEvent.change(screen.getByLabelText(/Credential ID/i), { 
      target: { value: 'TEST-001' } 
    });
    fireEvent.change(screen.getByLabelText(/Holder Name/i), { 
      target: { value: 'Test User' } 
    });
    fireEvent.change(screen.getByLabelText(/Credential Type/i), { 
      target: { value: 'Test' } 
    });

    const submitButton = screen.getByText(/Issue Credential/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Success/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        data: {
          message: 'Credential already exists'
        }
      }
    });

    render(<IssuancePage />);
    
    fireEvent.change(screen.getByLabelText(/Credential ID/i), { 
      target: { value: 'TEST-001' } 
    });
    fireEvent.change(screen.getByLabelText(/Holder Name/i), { 
      target: { value: 'Test User' } 
    });
    fireEvent.change(screen.getByLabelText(/Credential Type/i), { 
      target: { value: 'Test' } 
    });

    const submitButton = screen.getByText(/Issue Credential/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });
});



