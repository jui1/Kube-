import { useState, FormEvent } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config';
import { Credential, IssuanceResponse } from '../types';

function IssuancePage() {
  const [formData, setFormData] = useState<Credential>({
    id: '',
    holderName: '',
    credentialType: '',
    issuedDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    data: {}
  });

  const [additionalData, setAdditionalData] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<IssuanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Parse additional data if provided
      let parsedData = {};
      if (additionalData.trim()) {
        try {
          parsedData = JSON.parse(additionalData);
        } catch {
          setError('Invalid JSON in additional data field');
          setLoading(false);
          return;
        }
      }

      const credentialToIssue: Credential = {
        ...formData,
        data: Object.keys(parsedData).length > 0 ? parsedData : undefined,
        expiryDate: formData.expiryDate || undefined
      };

      const result = await axios.post<IssuanceResponse>(
        `${API_CONFIG.ISSUANCE_SERVICE_URL}/api/issue`,
        credentialToIssue
      );

      setResponse(result.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Credential, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      id: '',
      holderName: '',
      credentialType: '',
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      data: {}
    });
    setAdditionalData('');
    setResponse(null);
    setError(null);
  };

  return (
    <div className="page">
      <h2 className="page-title">Issue Credential</h2>
      <p className="page-description">
        Create and issue a new credential. Each credential must have a unique ID.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Credential ID *</label>
          <input
            type="text"
            className="form-input"
            value={formData.id}
            onChange={(e) => handleInputChange('id', e.target.value)}
            placeholder="e.g., CRED-2025-001"
            required
          />
          <span className="form-hint">Must be unique across all credentials</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Holder Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.holderName}
              onChange={(e) => handleInputChange('holderName', e.target.value)}
              placeholder="e.g., John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Credential Type *</label>
            <input
              type="text"
              className="form-input"
              value={formData.credentialType}
              onChange={(e) => handleInputChange('credentialType', e.target.value)}
              placeholder="e.g., Identity, License, Certificate"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Issued Date *</label>
            <input
              type="date"
              className="form-input"
              value={formData.issuedDate}
              onChange={(e) => handleInputChange('issuedDate', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              min={formData.issuedDate}
            />
            <span className="form-hint">Optional</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Additional Data (JSON)</label>
          <textarea
            className="form-textarea"
            value={additionalData}
            onChange={(e) => setAdditionalData(e.target.value)}
            placeholder='{"age": 30, "department": "Engineering"}'
          />
          <span className="form-hint">Optional: Enter valid JSON for additional credential data</span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Issuing...
              </>
            ) : (
              '🎫 Issue Credential'
            )}
          </button>
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Reset Form
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-error">
          <div>
            <div className="alert-title">❌ Error</div>
            <div className="alert-message">{error}</div>
          </div>
        </div>
      )}

      {response && (
        <div className={`alert ${response.success ? 'alert-success' : 'alert-warning'}`}>
          <div>
            <div className="alert-title">
              {response.success ? '✅ Success' : '⚠️ Warning'}
            </div>
            <div className="alert-message">{response.message}</div>
          </div>
        </div>
      )}

      {response && response.success && (
        <div className="result-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Issuance Details
          </h3>
          <div className="result-row">
            <span className="result-label">Worker ID:</span>
            <span className="result-value">{response.workerId}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Timestamp:</span>
            <span className="result-value">
              {new Date(response.timestamp).toLocaleString()}
            </span>
          </div>
          {response.credential && (
            <>
              <div className="result-row">
                <span className="result-label">Credential ID:</span>
                <span className="result-value">{response.credential.id}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Holder:</span>
                <span className="result-value">{response.credential.holderName}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Type:</span>
                <span className="result-value">{response.credential.credentialType}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default IssuancePage;



