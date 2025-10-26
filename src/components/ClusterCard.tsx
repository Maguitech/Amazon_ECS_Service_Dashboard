import React from 'react';
import type { ECSCluster } from '../types/aws';
import './ClusterCard.css';

interface ClusterCardProps {
  cluster: ECSCluster;
  onClick: () => void;
  isSelected: boolean;
}

const ClusterCard: React.FC<ClusterCardProps> = ({ cluster, onClick, isSelected }) => {
  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'status-active';
      case 'INACTIVE':
        return 'status-inactive';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className={`cluster-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="cluster-header">
        <h3>{cluster.clusterName}</h3>
        <span className={`status-badge ${getStatusColor(cluster.status)}`}>
          {cluster.status}
        </span>
      </div>
      <div className="cluster-stats">
        <div className="stat-item">
          <span className="stat-label">Services</span>
          <span className="stat-value">{cluster.activeServicesCount || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Running</span>
          <span className="stat-value running">{cluster.runningTasksCount || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending</span>
          <span className="stat-value pending">{cluster.pendingTasksCount || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ClusterCard;
