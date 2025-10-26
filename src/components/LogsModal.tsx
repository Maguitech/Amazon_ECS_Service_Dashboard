import React, { useState } from 'react';
import type { LogEvent } from '../types/aws';
import { AWSService } from '../services/awsService';
import { useAWS } from '../contexts/AWSContext';
import './LogsModal.css';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogsModal: React.FC<LogsModalProps> = ({ isOpen, onClose }) => {
  const { credentials } = useAWS();
  const [logGroupName, setLogGroupName] = useState('');
  const [logStreams, setLogStreams] = useState<Array<{ logStreamName?: string; lastEventTime?: number }>>([]);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchLogs = async () => {
    if (!credentials || !logGroupName) {
      setError('Please enter a log group name');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const awsService = new AWSService(credentials);
      const streams = await awsService.getLogStreams(logGroupName);
      setLogStreams(streams);
      setSelectedStream(null);
      setLogs([]);
    } catch (err) {
      setError('Error loading log streams: ' + (err as Error).message);
      setLogStreams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStream = async (streamName: string) => {
    if (!credentials || !logGroupName) return;

    setSelectedStream(streamName);
    setLoading(true);
    setError(null);
    try {
      const awsService = new AWSService(credentials);
      const events = await awsService.getLogEvents(logGroupName, streamName, 200);
      setLogs(events);
    } catch (err) {
      setError('Error loading log events: ' + (err as Error).message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <h2>CloudWatch Logs</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="logs-search">
          <input
            type="text"
            placeholder="/ecs/my-service-name"
            value={logGroupName}
            onChange={(e) => setLogGroupName(e.target.value)}
            className="logs-input"
          />
          <button className="btn-search" onClick={handleSearchLogs} disabled={loading}>
            {loading ? 'Searching...' : 'Search Log Group'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="logs-content">
          <div className="logs-sidebar">
            <h4>Log Streams</h4>
            {logStreams.length === 0 ? (
              <p className="empty-text">No log streams found</p>
            ) : (
              <div className="streams-list">
                {logStreams.map((stream, idx) => (
                  <div
                    key={idx}
                    className={`stream-item ${selectedStream === stream.logStreamName ? 'active' : ''}`}
                    onClick={() => handleSelectStream(stream.logStreamName!)}
                  >
                    <div className="stream-name">{stream.logStreamName?.split('/').pop()}</div>
                    <div className="stream-time">{formatTimestamp(stream.lastEventTime)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="logs-viewer">
            {!selectedStream ? (
              <div className="empty-viewer">
                <p>Select a log stream to view events</p>
              </div>
            ) : loading ? (
              <div className="loading-viewer">
                <div className="spinner"></div>
                <p>Loading logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="empty-viewer">
                <p>No log events found</p>
              </div>
            ) : (
              <div className="logs-list">
                {logs.map((log, idx) => (
                  <div key={idx} className="log-entry">
                    <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsModal;
