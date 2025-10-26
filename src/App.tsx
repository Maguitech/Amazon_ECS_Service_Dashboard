import { useState, useEffect } from 'react';
import { AWSProvider, useAWS } from './contexts/AWSContext';
import CredentialsModal from './components/CredentialsModal';
import Dashboard from './components/Dashboard';
import './App.css';

function AppContent() {
  const { isConfigured } = useAWS();
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  useEffect(() => {
    if (!isConfigured) {
      setShowCredentialsModal(true);
    }
  }, [isConfigured]);

  return (
    <>
      {isConfigured ? (
        <Dashboard />
      ) : (
        <div className="welcome-screen">
          <div className="welcome-card">
            <h1>Welcome to AWS ECS Dashboard</h1>
            <p>Professional monitoring tool for your AWS ECS infrastructure</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Real-time cluster and service monitoring</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚖️</span>
                <span>Load balancer health tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📋</span>
                <span>CloudWatch logs viewer</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <span>Task restart capabilities</span>
              </div>
            </div>
            <button className="btn-get-started" onClick={() => setShowCredentialsModal(true)}>
              Get Started
            </button>
          </div>
        </div>
      )}

      <CredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
      />
    </>
  );
}

function App() {
  return (
    <AWSProvider>
      <AppContent />
    </AWSProvider>
  );
}

export default App;
