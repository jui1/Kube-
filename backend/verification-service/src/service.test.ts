import { VerificationService } from './service';
import { VerificationDatabase } from './database';
import { Credential } from './types';
import fs from 'fs';
import path from 'path';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VerificationService', () => {
  let service: VerificationService;
  let db: VerificationDatabase;
  const testDbPath = path.join(__dirname, '../test-verifications.db');

  beforeEach(() => {
    db = new VerificationDatabase(testDbPath);
    service = new VerificationService(db, 'http://localhost:3001');
    jest.clearAllMocks();
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('verifyCredential', () => {
    it('should verify a valid credential', async () => {
      const credential: Credential = {
        id: 'CRED-001',
        holderName: 'John Doe',
        credentialType: 'Identity',
        issuedDate: '2025-10-07'
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          credentials: [{
            id: 'CRED-001',
            holderName: 'John Doe',
            credentialType: 'Identity',
            issuedDate: '2025-10-07',
            workerId: 'worker-1',
            timestamp: '2025-10-07T10:00:00Z'
          }]
        }
      });

      const result = await service.verifyCredential(credential);

      expect(result.success).toBe(true);
      expect(result.verified).toBe(true);
      expect(result.message).toContain('valid and has been verified');
      expect(result.issuedBy).toBe('worker-1');
      expect(result.workerId).toBeDefined();
    });

    it('should reject credential not in issuance records', async () => {
      const credential: Credential = {
        id: 'CRED-999',
        holderName: 'Unknown Person',
        credentialType: 'Unknown',
        issuedDate: '2025-10-07'
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          credentials: []
        }
      });

      const result = await service.verifyCredential(credential);

      expect(result.success).toBe(true);
      expect(result.verified).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should reject credential with mismatched details', async () => {
      const credential: Credential = {
        id: 'CRED-001',
        holderName: 'Wrong Name',
        credentialType: 'Identity',
        issuedDate: '2025-10-07'
      };

      mockedAxios.get.mockResolvedValue({
        data: {
          credentials: [{
            id: 'CRED-001',
            holderName: 'John Doe',
            credentialType: 'Identity',
            issuedDate: '2025-10-07',
            workerId: 'worker-1',
            timestamp: '2025-10-07T10:00:00Z'
          }]
        }
      });

      const result = await service.verifyCredential(credential);

      expect(result.success).toBe(true);
      expect(result.verified).toBe(false);
      expect(result.message).toContain('details do not match');
    });

    it('should handle service connection errors', async () => {
      const credential: Credential = {
        id: 'CRED-001',
        holderName: 'John Doe',
        credentialType: 'Identity',
        issuedDate: '2025-10-07'
      };

      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await service.verifyCredential(credential);

      expect(result.success).toBe(false);
      expect(result.verified).toBe(false);
      expect(result.message).toContain('Error connecting');
    });
  });

  describe('getWorkerId', () => {
    it('should return a worker ID', () => {
      const workerId = service.getWorkerId();
      expect(workerId).toBeDefined();
      expect(typeof workerId).toBe('string');
    });
  });

  describe('getVerificationHistory', () => {
    it('should return verification history for a credential', async () => {
      const credential: Credential = {
        id: 'CRED-TEST',
        holderName: 'Test User',
        credentialType: 'Test',
        issuedDate: '2025-10-07'
      };

      mockedAxios.get.mockResolvedValue({
        data: { credentials: [] }
      });

      await service.verifyCredential(credential);

      const history = service.getVerificationHistory('CRED-TEST');
      expect(history.length).toBeGreaterThan(0);
    });
  });
});


