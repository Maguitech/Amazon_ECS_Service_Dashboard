import React, { useState, useEffect } from 'react';
import type { LoadBalancer as LoadBalancerType } from '@aws-sdk/client-elastic-load-balancing-v2';
import type { TargetGroup as TargetGroupType } from '@aws-sdk/client-elastic-load-balancing-v2';
import type { TargetHealthDescription } from '@aws-sdk/client-elastic-load-balancing-v2';
import { AWSService } from '../services/awsService';
import { useAWS } from '../contexts/AWSContext';
import './LoadBalancerCard.css';

interface LoadBalancerCardProps {
  loadBalancer: LoadBalancerType;
}

const LoadBalancerCard: React.FC<LoadBalancerCardProps> = ({ loadBalancer }) => {
  const { credentials } = useAWS();
  const [targetGroups, setTargetGroups] = useState<TargetGroupType[]>([]);
  const [targetHealthMap, setTargetHealthMap] = useState<Map<string, TargetHealthDescription[]>>(new Map());
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && credentials && loadBalancer.LoadBalancerArn) {
      loadTargetGroups();
    }
  }, [expanded, credentials, loadBalancer.LoadBalancerArn]);

  const loadTargetGroups = async () => {
    if (!credentials || !loadBalancer.LoadBalancerArn) return;
    setLoading(true);
    try {
      const awsService = new AWSService(credentials);
      const tgs = await awsService.listTargetGroups(loadBalancer.LoadBalancerArn);
      setTargetGroups(tgs);

      const healthMap = new Map<string, TargetHealthDescription[]>();
      for (const tg of tgs) {
        if (tg.TargetGroupArn) {
          const health = await awsService.describeTargetHealth(tg.TargetGroupArn);
          healthMap.set(tg.TargetGroupArn, health);
        }
      }
      setTargetHealthMap(healthMap);
    } catch (error) {
      console.error('Error loading target groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state?: string) => {
    switch (state?.toLowerCase()) {
      case 'active':
        return 'lb-active';
      case 'provisioning':
        return 'lb-provisioning';
      case 'failed':
        return 'lb-failed';
      default:
        return 'lb-unknown';
    }
  };

  const getHealthColor = (state?: string) => {
    switch (state?.toLowerCase()) {
      case 'healthy':
        return 'target-healthy';
      case 'unhealthy':
        return 'target-unhealthy';
      case 'initial':
        return 'target-initial';
      case 'draining':
        return 'target-draining';
      default:
        return 'target-unknown';
    }
  };

  return (
    <div className="lb-card">
      <div className="lb-header" onClick={() => setExpanded(!expanded)}>
        <div className="lb-info">
          <h4>{loadBalancer.LoadBalancerName}</h4>
          <span className={`lb-state ${getStateColor(loadBalancer.State?.Code)}`}>
            {loadBalancer.State?.Code || 'unknown'}
          </span>
        </div>
        <button className="btn-expand">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="lb-details">
        <div className="lb-detail">
          <span className="detail-label">DNS:</span>
          <span className="detail-value dns-name">{loadBalancer.DNSName}</span>
        </div>
        <div className="lb-detail">
          <span className="detail-label">Type:</span>
          <span className="detail-value">{loadBalancer.Type}</span>
        </div>
        <div className="lb-detail">
          <span className="detail-label">Scheme:</span>
          <span className="detail-value">{loadBalancer.Scheme}</span>
        </div>
      </div>

      {expanded && (
        <div className="lb-expanded-content">
          {loading ? (
            <div className="loading-small">
              <div className="spinner-small"></div>
              <span>Loading target groups...</span>
            </div>
          ) : (
            <div className="target-groups">
              <h5>Target Groups ({targetGroups.length})</h5>
              {targetGroups.map((tg) => (
                <div key={tg.TargetGroupArn} className="target-group">
                  <div className="tg-header">
                    <span className="tg-name">{tg.TargetGroupName}</span>
                    <span className={`tg-health ${tg.HealthCheckEnabled ? 'enabled' : 'disabled'}`}>
                      Health Check: {tg.HealthCheckEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {tg.HealthCheckPath && (
                    <div className="tg-detail">
                      <span className="detail-label">Health Check Path:</span>
                      <span className="detail-value">{tg.HealthCheckPath}</span>
                    </div>
                  )}

                  {tg.TargetGroupArn && targetHealthMap.has(tg.TargetGroupArn) && (
                    <div className="targets">
                      <span className="targets-label">Targets:</span>
                      {targetHealthMap.get(tg.TargetGroupArn)?.map((health, idx) => (
                        <div key={idx} className="target-item">
                          <span className="target-id">
                            {health.Target?.Id?.substring(0, 12)}...:{health.Target?.Port}
                          </span>
                          <span className={`target-state ${getHealthColor(health.TargetHealth?.State)}`}>
                            {health.TargetHealth?.State || 'unknown'}
                          </span>
                          {health.TargetHealth?.Reason && (
                            <span className="target-reason">{health.TargetHealth.Reason}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {targetGroups.length === 0 && (
                <p className="empty-message">No target groups found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoadBalancerCard;
