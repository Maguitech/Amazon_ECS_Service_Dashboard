import React, { useState } from 'react';
import { useAWS } from '../contexts/AWSContext';
import './CredentialsModal.css';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose }) => {
  const { setCredentials } = useAWS();
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  const [region, setRegion] = useState('us-east-1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKeyId && secretAccessKey && region) {
      setCredentials({ accessKeyId, secretAccessKey, region });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>AWS Configuration</h2>
        <p className="modal-description">
          Enter your AWS credentials to start monitoring your ECS infrastructure.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="accessKeyId">Access Key ID</label>
            <input
              type="text"
              id="accessKeyId"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="secretAccessKey">Secret Access Key</label>
            <input
              type="password"
              id="secretAccessKey"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="region">AWS Region</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            >
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-east-2">US East (Ohio)</option>
              <option value="us-west-1">US West (N. California)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="eu-west-2">EU (London)</option>
              <option value="eu-central-1">EU (Frankfurt)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              <option value="ap-southeast-2">Asia Pacific (Sydney)</option>
              <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
              <option value="sa-east-1">South America (São Paulo)</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-primary">
              Save Configuration
            </button>
          </div>
        </form>
        <div className="security-notice">
          <strong>Security Notice:</strong> Credentials are stored locally in your browser.
          <br />
          Required IAM permissions: ECS (Read/Write), ELB (Read), CloudWatch Logs (Read)
        </div>
      </div>
    </div>
  );
};

export default CredentialsModal;
