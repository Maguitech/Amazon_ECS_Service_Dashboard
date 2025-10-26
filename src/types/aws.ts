export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface ECSCluster {
  clusterArn?: string;
  clusterName?: string;
  status?: string;
  runningTasksCount?: number;
  pendingTasksCount?: number;
  activeServicesCount?: number;
}

export interface ECSService {
  serviceArn?: string;
  serviceName?: string;
  status?: string;
  desiredCount?: number;
  runningCount?: number;
  pendingCount?: number;
  loadBalancers?: Array<{
    targetGroupArn?: string;
    containerName?: string;
    containerPort?: number;
  }>;
}

export interface ECSTask {
  taskArn?: string;
  taskDefinitionArn?: string;
  clusterArn?: string;
  lastStatus?: string;
  desiredStatus?: string;
  cpu?: string;
  memory?: string;
  startedAt?: Date;
  containers?: Array<{
    name?: string;
    lastStatus?: string;
    networkBindings?: Array<any>;
  }>;
}

export interface LoadBalancer {
  loadBalancerArn?: string;
  dnsName?: string;
  loadBalancerName?: string;
  state?: {
    code?: string;
  };
  type?: string;
  scheme?: string;
}

export interface TargetGroup {
  targetGroupArn?: string;
  targetGroupName?: string;
  healthCheckEnabled?: boolean;
  healthCheckPath?: string;
  targetType?: string;
}

export interface TargetHealth {
  target?: {
    id?: string;
    port?: number;
  };
  healthCheckPort?: string;
  targetHealth?: {
    state?: string;
    reason?: string;
  };
}

export interface LogEvent {
  timestamp?: number;
  message?: string;
  ingestionTime?: number;
}
