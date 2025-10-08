import express, { Request, Response } from 'express';
import cors from 'cors';
import { CredentialDatabase } from './database';
import { IssuanceService } from './service';
import { Credential } from './types';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database and service
const db = new CredentialDatabase();
const issuanceService = new IssuanceService(db);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    service: 'issuance-service',
    workerId: issuanceService.getWorkerId()
  });
});

// Issue credential endpoint
app.post('/api/issue', (req: Request, res: Response) => {
  try {
    const credential: Credential = req.body;

    // Validate required fields
    if (!credential.id || !credential.holderName || !credential.credentialType || !credential.issuedDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: id, holderName, credentialType, issuedDate'
      });
    }

    const result = issuanceService.issueCredential(credential);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(409).json(result);
    }
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all credentials endpoint (for debugging/testing)
app.get('/api/credentials', (req: Request, res: Response) => {
  try {
    const credentials = issuanceService.getAllCredentials();
    res.json({
      success: true,
      count: credentials.length,
      credentials
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
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
    console.log(`Issuance Service running on port ${PORT}`);
    console.log(`Worker ID: ${issuanceService.getWorkerId()}`);
  });
}

export { app, issuanceService };


