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

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}


