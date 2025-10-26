import React, { useState, useEffect } from 'react';
import type { ECSTask } from '../types/aws';
import { AWSService } from '../services/awsService';
import { useAWS } from '../contexts/AWSContext';
import './TasksModal.css';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusterArn: string;
  serviceName: string;
}

const TasksModal: React.FC<TasksModalProps> = ({ isOpen, onClose, clusterArn, serviceName }) => {
  const { credentials } = useAWS();
  const [tasks, setTasks] = useState<ECSTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [restarting, setRestarting] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && credentials) {
      loadTasks();
    }
  }, [isOpen, credentials, clusterArn, serviceName]);

  const loadTasks = async () => {
    if (!credentials) return;
    setLoading(true);
    try {
      const awsService = new AWSService(credentials);
      const taskArns = await awsService.listTasks(clusterArn, serviceName);
      const taskDetails = await awsService.describeTasks(clusterArn, taskArns);
      setTasks(taskDetails);
    } catch (error) {
      console.error('Error loading tasks:', error);
      alert('Error loading tasks: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestartTask = async (taskArn: string) => {
    if (!credentials) return;
    if (!confirm('Are you sure you want to restart this task? ECS will automatically start a new one.')) {
      return;
    }

    setRestarting(taskArn);
    try {
      const awsService = new AWSService(credentials);
      await awsService.stopTask(clusterArn, taskArn);
      alert('Task stopped successfully. ECS will start a new task automatically.');
      await loadTasks();
    } catch (error) {
      console.error('Error restarting task:', error);
      alert('Error restarting task: ' + (error as Error).message);
    } finally {
      setRestarting(null);
    }
  };

  const getTaskId = (taskArn?: string) => {
    return taskArn?.split('/').pop() || 'Unknown';
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'RUNNING':
        return 'status-running';
      case 'PENDING':
        return 'status-pending';
      case 'STOPPED':
        return 'status-stopped';
      default:
        return 'status-unknown';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-bar">
          <h2>Tasks - {serviceName}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks found for this service</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.taskArn} className="task-item">
                  <div className="task-header">
                    <div className="task-info">
                      <span className="task-id">{getTaskId(task.taskArn)}</span>
                      <span className={`status-badge ${getStatusColor(task.lastStatus)}`}>
                        {task.lastStatus}
                      </span>
                    </div>
                    <button
                      className="btn-restart"
                      onClick={() => handleRestartTask(task.taskArn!)}
                      disabled={restarting === task.taskArn || task.lastStatus !== 'RUNNING'}
                    >
                      {restarting === task.taskArn ? 'Restarting...' : '🔄 Restart'}
                    </button>
                  </div>

                  <div className="task-details">
                    <div className="task-detail-item">
                      <span className="detail-label">CPU:</span>
                      <span className="detail-value">{task.cpu || 'N/A'}</span>
                    </div>
                    <div className="task-detail-item">
                      <span className="detail-label">Memory:</span>
                      <span className="detail-value">{task.memory || 'N/A'}</span>
                    </div>
                    <div className="task-detail-item">
                      <span className="detail-label">Started:</span>
                      <span className="detail-value">
                        {task.startedAt ? new Date(task.startedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {task.containers && task.containers.length > 0 && (
                    <div className="task-containers">
                      <span className="containers-label">Containers:</span>
                      {task.containers.map((container, idx) => (
                        <span key={idx} className="container-badge">
                          {container.name} - {container.lastStatus}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksModal;
