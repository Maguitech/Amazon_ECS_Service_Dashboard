import React, { useState, useEffect } from 'react';
import { useAWS } from '../contexts/AWSContext';
import { AWSService } from '../services/awsService';
import type { ECSCluster, ECSService } from '../types/aws';
import type { LoadBalancer } from '@aws-sdk/client-elastic-load-balancing-v2';
import ClusterCard from './ClusterCard';
import ServiceCard from './ServiceCard';
import LoadBalancerCard from './LoadBalancerCard';
import TasksModal from './TasksModal';
import LogsModal from './LogsModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { credentials, setCredentials } = useAWS();
  const [clusters, setClusters] = useState<ECSCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ECSCluster | null>(null);
  const [services, setServices] = useState<ECSService[]>([]);
  const [loadBalancers, setLoadBalancers] = useState<LoadBalancer[]>([]);
  const [loading, setLoading] = useState(false);
  const [tasksModalOpen, setTasksModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ECSService | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (credentials) {
      loadData();
    }
  }, [credentials]);

  useEffect(() => {
    if (autoRefresh && credentials) {
      const interval = setInterval(() => {
        loadData();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, credentials]);

  const loadData = async () => {
    if (!credentials) return;
    setLoading(true);
    try {
      const awsService = new AWSService(credentials);

      // Load clusters
      const clusterArns = await awsService.listClusters();
      const clusterDetails = await awsService.describeClusters(clusterArns);
      setClusters(clusterDetails);

      // Load load balancers
      const lbs = await awsService.listLoadBalancers();
      setLoadBalancers(lbs);

      // If a cluster is selected, refresh its services
      if (selectedCluster?.clusterArn) {
        await loadServices(selectedCluster.clusterArn);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading AWS data: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (clusterArn: string) => {
    if (!credentials) return;
    try {
      const awsService = new AWSService(credentials);
      const serviceArns = await awsService.listServices(clusterArn);
      const serviceDetails = await awsService.describeServices(clusterArn, serviceArns);
      setServices(serviceDetails);
    } catch (error) {
      console.error('Error loading services:', error);
      alert('Error loading services: ' + (error as Error).message);
    }
  };

  const handleClusterSelect = async (cluster: ECSCluster) => {
    setSelectedCluster(cluster);
    setServices([]);
    if (cluster.clusterArn) {
      await loadServices(cluster.clusterArn);
    }
  };

  const handleViewTasks = (service: ECSService) => {
    setSelectedService(service);
    setTasksModalOpen(true);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? Your credentials will be removed.')) {
      setCredentials(null);
      setClusters([]);
      setServices([]);
      setLoadBalancers([]);
      setSelectedCluster(null);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>AWS ECS Dashboard</h1>
          <p className="header-subtitle">Monitor your ECS infrastructure in real-time</p>
        </div>
        <div className="header-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button className="btn-action" onClick={() => setLogsModalOpen(true)}>
            📋 View Logs
          </button>
          <button className="btn-action" onClick={loadData} disabled={loading}>
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Clusters Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>ECS Clusters</h2>
            <span className="section-badge">{clusters.length}</span>
          </div>
          {loading && clusters.length === 0 ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Loading clusters...</p>
            </div>
          ) : clusters.length === 0 ? (
            <div className="empty-section">
              <p>No ECS clusters found in this region</p>
            </div>
          ) : (
            <div className="clusters-grid">
              {clusters.map((cluster) => (
                <ClusterCard
                  key={cluster.clusterArn}
                  cluster={cluster}
                  onClick={() => handleClusterSelect(cluster)}
                  isSelected={selectedCluster?.clusterArn === cluster.clusterArn}
                />
              ))}
            </div>
          )}
        </section>

        {/* Services Section */}
        {selectedCluster && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Services - {selectedCluster.clusterName}</h2>
              <span className="section-badge">{services.length}</span>
            </div>
            {services.length === 0 ? (
              <div className="empty-section">
                <p>No services found in this cluster</p>
              </div>
            ) : (
              <div className="services-grid">
                {services.map((service) => (
                  <ServiceCard
                    key={service.serviceArn}
                    service={service}
                    onViewTasks={() => handleViewTasks(service)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Load Balancers Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Load Balancers</h2>
            <span className="section-badge">{loadBalancers.length}</span>
          </div>
          {loading && loadBalancers.length === 0 ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Loading load balancers...</p>
            </div>
          ) : loadBalancers.length === 0 ? (
            <div className="empty-section">
              <p>No load balancers found in this region</p>
            </div>
          ) : (
            <div className="lb-list">
              {loadBalancers.map((lb) => (
                <LoadBalancerCard key={lb.LoadBalancerArn} loadBalancer={lb} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      {tasksModalOpen && selectedService && selectedCluster && (
        <TasksModal
          isOpen={tasksModalOpen}
          onClose={() => setTasksModalOpen(false)}
          clusterArn={selectedCluster.clusterArn!}
          serviceName={selectedService.serviceName!}
        />
      )}

      <LogsModal isOpen={logsModalOpen} onClose={() => setLogsModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
