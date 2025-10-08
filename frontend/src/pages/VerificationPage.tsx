import { useState, FormEvent } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../config';
import { Credential, VerificationResponse } from '../types';

function VerificationPage() {
  const [formData, setFormData] = useState<Credential>({
    id: '',
    holderName: '',
    credentialType: '',
    issuedDate: '',
    expiryDate: '',
    data: {}
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const credentialToVerify: Credential = {
        id: formData.id,
        holderName: formData.holderName,
        credentialType: formData.credentialType,
        issuedDate: formData.issuedDate,
        expiryDate: formData.expiryDate || undefined
      };

      const result = await axios.post<VerificationResponse>(
        `${API_CONFIG.VERIFICATION_SERVICE_URL}/api/verify`,
        { credential: credentialToVerify }
      );

      setResponse(result.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to verify credential');
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
      issuedDate: '',
      expiryDate: '',
      data: {}
    });
    setResponse(null);
    setError(null);
  };

  return (
    <div className="page">
      <h2 className="page-title">Verify Credential</h2>
      <p className="page-description">
        Enter credential details to verify if it has been issued and is valid.
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
            />
            <span className="form-hint">Optional</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              '🔍 Verify Credential'
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
        <div className={`alert ${response.verified ? 'alert-success' : 'alert-error'}`}>
          <div>
            <div className="alert-title">
              {response.verified ? '✅ Credential Verified' : '❌ Verification Failed'}
            </div>
            <div className="alert-message">{response.message}</div>
          </div>
        </div>
      )}

      {response && (
        <div className="result-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Verification Details
          </h3>
          <div className="result-row">
            <span className="result-label">Status:</span>
            <span className="result-value" style={{ 
              color: response.verified ? 'var(--secondary-color)' : 'var(--danger-color)',
              fontWeight: 'bold'
            }}>
              {response.verified ? 'VALID' : 'INVALID'}
            </span>
          </div>
          <div className="result-row">
            <span className="result-label">Verified By:</span>
            <span className="result-value">{response.workerId}</span>
          </div>
          <div className="result-row">
            <span className="result-label">Verification Time:</span>
            <span className="result-value">
              {new Date(response.timestamp).toLocaleString()}
            </span>
          </div>
          {response.verified && response.issuedBy && (
            <>
              <div className="result-row">
                <span className="result-label">Originally Issued By:</span>
                <span className="result-value">{response.issuedBy}</span>
              </div>
              <div className="result-row">
                <span className="result-label">Issuance Time:</span>
                <span className="result-value">
                  {response.issuedAt ? new Date(response.issuedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default VerificationPage;



