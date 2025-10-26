import React from 'react';
import type { ECSService } from '../types/aws';
import './ServiceCard.css';

interface ServiceCardProps {
  service: ECSService;
  onViewTasks: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onViewTasks }) => {
  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'status-active';
      case 'DRAINING':
        return 'status-draining';
      case 'INACTIVE':
        return 'status-inactive';
      default:
        return 'status-unknown';
    }
  };

  const isHealthy = service.runningCount === service.desiredCount;

  return (
    <div className="service-card">
      <div className="service-header">
        <div>
          <h4>{service.serviceName}</h4>
          <span className={`status-badge ${getStatusColor(service.status)}`}>
            {service.status}
          </span>
        </div>
        <button className="btn-view-tasks" onClick={onViewTasks}>
          View Tasks
        </button>
      </div>

      <div className="service-metrics">
        <div className="metric">
          <span className="metric-label">Desired</span>
          <span className="metric-value">{service.desiredCount || 0}</span>
        </div>
        <div className="metric">
          <span className="metric-label">Running</span>
          <span className={`metric-value ${isHealthy ? 'healthy' : 'unhealthy'}`}>
            {service.runningCount || 0}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Pending</span>
          <span className="metric-value">{service.pendingCount || 0}</span>
        </div>
      </div>

      {service.loadBalancers && service.loadBalancers.length > 0 && (
        <div className="service-lb-info">
          <span className="lb-icon">⚖️</span>
          <span className="lb-text">
            Load Balanced ({service.loadBalancers.length} target group
            {service.loadBalancers.length > 1 ? 's' : ''})
          </span>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
