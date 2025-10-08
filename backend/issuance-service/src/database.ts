import Database from 'better-sqlite3';
import path from 'path';
import { Credential } from './types';

export class CredentialDatabase {
  private db: Database.Database;

  constructor(dbPath: string = path.join(__dirname, '../data/credentials.db')) {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS credentials (
        id TEXT PRIMARY KEY,
        holderName TEXT NOT NULL,
        credentialType TEXT NOT NULL,
        issuedDate TEXT NOT NULL,
        expiryDate TEXT,
        data TEXT,
        workerId TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);
  }

  public credentialExists(id: string): boolean {
    const stmt = this.db.prepare('SELECT id FROM credentials WHERE id = ?');
    const result = stmt.get(id);
    return result !== undefined;
  }

  public insertCredential(
    credential: Credential,
    workerId: string,
    timestamp: string
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO credentials (id, holderName, credentialType, issuedDate, expiryDate, data, workerId, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      credential.id,
      credential.holderName,
      credential.credentialType,
      credential.issuedDate,
      credential.expiryDate || null,
      credential.data ? JSON.stringify(credential.data) : null,
      workerId,
      timestamp
    );
  }

  public getCredential(id: string): any {
    const stmt = this.db.prepare('SELECT * FROM credentials WHERE id = ?');
    return stmt.get(id);
  }

  public getAllCredentials(): any[] {
    const stmt = this.db.prepare('SELECT * FROM credentials');
    return stmt.all();
  }

  public close(): void {
    this.db.close();
  }
}


