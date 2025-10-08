import { VerificationDatabase } from './database';
import { Credential, VerificationResponse } from './types';
import axios from 'axios';
import os from 'os';

export class VerificationService {
  private db: VerificationDatabase;
  private workerId: string;
  private issuanceServiceUrl: string;

  constructor(db: VerificationDatabase, issuanceServiceUrl?: string) {
    this.db = db;
    this.workerId = process.env.WORKER_ID || os.hostname() || 'worker-1';
    this.issuanceServiceUrl = issuanceServiceUrl || 
      process.env.ISSUANCE_SERVICE_URL || 
      'http://issuance-service:3001';
  }

  public async verifyCredential(credential: Credential): Promise<VerificationResponse> {
    const timestamp = new Date().toISOString();

    try {
      // Query the issuance service to check if credential exists
      const response = await axios.get(
        `${this.issuanceServiceUrl}/api/credentials`
      );

      const issuedCredentials = response.data.credentials || [];
      const matchingCredential = issuedCredentials.find(
        (c: any) => c.id === credential.id
      );

      if (matchingCredential) {
        // Verify additional fields match
        const isValid = 
          matchingCredential.holderName === credential.holderName &&
          matchingCredential.credentialType === credential.credentialType &&
          matchingCredential.issuedDate === credential.issuedDate;

        // Log verification attempt
        this.db.logVerification(credential.id, isValid, this.workerId, timestamp);

        if (isValid) {
          return {
            success: true,
            verified: true,
            message: 'Credential is valid and has been verified',
            issuedBy: matchingCredential.workerId,
            issuedAt: matchingCredential.timestamp,
            workerId: this.workerId,
            timestamp
          };
        } else {
          return {
            success: true,
            verified: false,
            message: 'Credential ID exists but details do not match',
            workerId: this.workerId,
            timestamp
          };
        }
      } else {
        // Log failed verification
        this.db.logVerification(credential.id, false, this.workerId, timestamp);

        return {
          success: true,
          verified: false,
          message: 'Credential not found in issuance records',
          workerId: this.workerId,
          timestamp
        };
      }
    } catch (error) {
      console.error('Error verifying credential:', error);
      
      // Log failed verification
      this.db.logVerification(credential.id, false, this.workerId, timestamp);

      return {
        success: false,
        verified: false,
        message: 'Error connecting to issuance service',
        workerId: this.workerId,
        timestamp
      };
    }
  }

  public getWorkerId(): string {
    return this.workerId;
  }

  public getVerificationHistory(credentialId: string): any[] {
    return this.db.getVerificationHistory(credentialId);
  }

  public getAllVerifications(): any[] {
    return this.db.getAllVerifications();
  }
}


