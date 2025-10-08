export interface Credential {
  id: string;
  holderName: string;
  credentialType: string;
  issuedDate: string;
  expiryDate?: string;
  data?: Record<string, any>;
}

export interface VerificationRequest {
  credential: Credential;
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

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}


