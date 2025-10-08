import { CredentialDatabase } from './database';
import { Credential, IssuanceResponse } from './types';
import os from 'os';

export class IssuanceService {
  private db: CredentialDatabase;
  private workerId: string;

  constructor(db: CredentialDatabase) {
    this.db = db;
    // Generate worker ID from hostname or environment variable
    this.workerId = process.env.WORKER_ID || os.hostname() || 'worker-1';
  }

  public issueCredential(credential: Credential): IssuanceResponse {
    const timestamp = new Date().toISOString();

    // Check if credential already exists
    if (this.db.credentialExists(credential.id)) {
      const existing = this.db.getCredential(credential.id);
      return {
        success: false,
        message: `Credential with ID ${credential.id} has already been issued by ${existing.workerId}`,
        workerId: this.workerId,
        timestamp
      };
    }

    // Insert new credential
    this.db.insertCredential(credential, this.workerId, timestamp);

    return {
      success: true,
      message: `Credential issued by ${this.workerId}`,
      credential,
      workerId: this.workerId,
      timestamp
    };
  }

  public getWorkerId(): string {
    return this.workerId;
  }

  public getAllCredentials(): any[] {
    return this.db.getAllCredentials();
  }
}


