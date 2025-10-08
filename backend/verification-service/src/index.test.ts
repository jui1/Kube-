import request from 'supertest';
import { app } from './index';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Verification Service API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('verification-service');
      expect(response.body.workerId).toBeDefined();
    });
  });

  describe('POST /api/verify', () => {
    it('should verify a valid credential', async () => {
      const credential = {
        id: 'CRED-001',
        holderName: 'Test User',
        credentialType: 'Test Type',
        issuedDate: '2025-10-07'
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          credentials: [{
            id: 'CRED-001',
            holderName: 'Test User',
            credentialType: 'Test Type',
            issuedDate: '2025-10-07',
            workerId: 'worker-1',
            timestamp: '2025-10-07T10:00:00Z'
          }]
        }
      });

      const response = await request(app)
        .post('/api/verify')
        .send({ credential })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verified).toBe(true);
      expect(response.body.workerId).toBeDefined();
    });

    it('should reject credential with missing fields', async () => {
      const invalidCredential = {
        id: 'TEST-INVALID',
        holderName: 'Test User'
      };

      const response = await request(app)
        .post('/api/verify')
        .send({ credential: invalidCredential })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent credential', async () => {
      const credential = {
        id: 'CRED-FAKE',
        holderName: 'Fake User',
        credentialType: 'Fake',
        issuedDate: '2025-10-07'
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          credentials: []
        }
      });

      const response = await request(app)
        .post('/api/verify')
        .send({ credential })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.verified).toBe(false);
    });
  });

  describe('GET /api/verifications', () => {
    it('should return list of verifications', async () => {
      const response = await request(app).get('/api/verifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.verifications).toBeDefined();
      expect(Array.isArray(response.body.verifications)).toBe(true);
    });
  });
});



