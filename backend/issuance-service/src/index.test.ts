import request from 'supertest';
import { app } from './index';

describe('Issuance Service API', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('issuance-service');
      expect(response.body.workerId).toBeDefined();
    });
  });

  describe('POST /api/issue', () => {
    it('should issue a new credential', async () => {
      const credential = {
        id: `TEST-${Date.now()}`,
        holderName: 'Test User',
        credentialType: 'Test Type',
        issuedDate: '2025-10-07'
      };

      const response = await request(app)
        .post('/api/issue')
        .send(credential)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Credential issued by');
      expect(response.body.workerId).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
    });

    it('should reject credential with missing fields', async () => {
      const invalidCredential = {
        id: 'TEST-INVALID',
        holderName: 'Test User'
        // Missing credentialType and issuedDate
      };

      const response = await request(app)
        .post('/api/issue')
        .send(invalidCredential)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should reject duplicate credential ID', async () => {
      const credentialId = `TEST-DUP-${Date.now()}`;
      const credential = {
        id: credentialId,
        holderName: 'Test User',
        credentialType: 'Test Type',
        issuedDate: '2025-10-07'
      };

      // Issue first time
      await request(app)
        .post('/api/issue')
        .send(credential)
        .set('Content-Type', 'application/json');

      // Try to issue again
      const response = await request(app)
        .post('/api/issue')
        .send(credential)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already been issued');
    });
  });

  describe('GET /api/credentials', () => {
    it('should return list of credentials', async () => {
      const response = await request(app).get('/api/credentials');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.credentials).toBeDefined();
      expect(Array.isArray(response.body.credentials)).toBe(true);
    });
  });
});


