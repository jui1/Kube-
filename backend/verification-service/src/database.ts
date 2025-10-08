import Database from 'better-sqlite3';
import path from 'path';

export class VerificationDatabase {
  private db: Database.Database;

  constructor(dbPath: string = path.join(__dirname, '../data/verifications.db')) {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS verifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credentialId TEXT NOT NULL,
        verified BOOLEAN NOT NULL,
        workerId TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_credential_id ON verifications(credentialId)
    `);
  }

  public logVerification(
    credentialId: string,
    verified: boolean,
    workerId: string,
    timestamp: string
  ): void {
    const stmt = this.db.prepare(`
      INSERT INTO verifications (credentialId, verified, workerId, timestamp)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(credentialId, verified ? 1 : 0, workerId, timestamp);
  }

  public getVerificationHistory(credentialId: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM verifications 
      WHERE credentialId = ? 
      ORDER BY timestamp DESC
    `);
    return stmt.all(credentialId);
  }

  public getAllVerifications(): any[] {
    const stmt = this.db.prepare('SELECT * FROM verifications ORDER BY timestamp DESC');
    return stmt.all();
  }

  public close(): void {
    this.db.close();
  }
}


