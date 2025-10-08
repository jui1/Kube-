export interface Credential {
  id: string;
  holderName: string;
  credentialType: string;
  issuedDate: string;
  expiryDate?: string;
  data?: Record<string, any>;
}

export interface IssuanceResponse {
  success: boolean;
  message: string;
  credential?: Credential;
  workerId: string;
  timestamp: string;
}

export interface VerificationResponse {
  success: boolean;
  verified: boolean;
  message: string;
  issuedBy?: string;
  issuedAt?: string;
  workerId: string;
  timestamp: string;
}



