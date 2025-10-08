import { IssuanceService } from './service';
import { CredentialDatabase } from './database';
import { Credential } from './types';
import fs from 'fs';
import path from 'path';

describe('IssuanceService', () => {
  let service: IssuanceService;
  let db: CredentialDatabase;
  const testDbPath = path.join(__dirname, '../test-credentials.db');

  beforeEach(() => {
    // Create a fresh database for each test
    db = new CredentialDatabase(testDbPath);
    service = new IssuanceService(db);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('issueCredential', () => {
    it('should successfully issue a new credential', () => {
      const credential: Credential = {
        id: 'CRED-001',
        holderName: 'John Doe',
        credentialType: 'Identity',
        issuedDate: '2025-10-07',
        data: { age: 30 }
      };

      const result = service.issueCredential(credential);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Credential issued by');
      expect(result.credential).toEqual(credential);
      expect(result.workerId).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should reject duplicate credential', () => {
      const credential: Credential = {
        id: 'CRED-002',
        holderName: 'Jane Smith',
        credentialType: 'License',
        issuedDate: '2025-10-07'
      };

      // Issue first time
      const firstResult = service.issueCredential(credential);
      expect(firstResult.success).toBe(true);

      // Try to issue again
      const secondResult = service.issueCredential(credential);
      expect(secondResult.success).toBe(false);
      expect(secondResult.message).toContain('already been issued');
    });

    it('should handle credentials with expiry date', () => {
      const credential: Credential = {
        id: 'CRED-003',
        holderName: 'Bob Johnson',
        credentialType: 'Certificate',
        issuedDate: '2025-10-07',
        expiryDate: '2026-10-07'
      };

      const result = service.issueCredential(credential);

      expect(result.success).toBe(true);
      expect(result.credential?.expiryDate).toBe('2026-10-07');
    });
  });

  describe('getWorkerId', () => {
    it('should return a worker ID', () => {
      const workerId = service.getWorkerId();
      expect(workerId).toBeDefined();
      expect(typeof workerId).toBe('string');
      expect(workerId.length).toBeGreaterThan(0);
    });
  });

  describe('getAllCredentials', () => {
    it('should return empty array when no credentials issued', () => {
      const credentials = service.getAllCredentials();
      expect(credentials).toEqual([]);
    });

    it('should return all issued credentials', () => {
      const credential1: Credential = {
        id: 'CRED-004',
        holderName: 'Alice Brown',
        credentialType: 'Badge',
        issuedDate: '2025-10-07'
      };

      const credential2: Credential = {
        id: 'CRED-005',
        holderName: 'Charlie Davis',
        credentialType: 'Pass',
        issuedDate: '2025-10-07'
      };

      service.issueCredential(credential1);
      service.issueCredential(credential2);

      const credentials = service.getAllCredentials();
      expect(credentials.length).toBe(2);
    });
  });
});


