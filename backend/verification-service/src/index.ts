import express, { Request, Response } from 'express';
import cors from 'cors';
import { VerificationDatabase } from './database';
import { VerificationService } from './service';
import { Credential, VerificationRequest } from './types';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3002;

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database and service
const db = new VerificationDatabase();
const verificationService = new VerificationService(db);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'verification-service',
    workerId: verificationService.getWorkerId()
  });
});

// Verify credential endpoint
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { credential }: { credential: Credential } = req.body;

    // Validate required fields
    if (!credential || !credential.id || !credential.holderName || 
        !credential.credentialType || !credential.issuedDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required credential fields: id, holderName, credentialType, issuedDate'
      });
    }

    const result = await verificationService.verifyCredential(credential);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get verification history for a credential
app.get('/api/verifications/:credentialId', (req: Request, res: Response) => {
  try {
    const { credentialId } = req.params;
    const history = verificationService.getVerificationHistory(credentialId);
    
    res.json({
      success: true,
      credentialId,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Error fetching verification history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all verifications (for debugging/testing)
app.get('/api/verifications', (req: Request, res: Response) => {
  try {
    const verifications = verificationService.getAllVerifications();
    res.json({
      success: true,
      count: verifications.length,
      verifications
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Verification Service running on port ${PORT}`);
    console.log(`Worker ID: ${verificationService.getWorkerId()}`);
  });
}

export { app, verificationService };


