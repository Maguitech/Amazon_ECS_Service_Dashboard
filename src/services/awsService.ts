import {
  ECSClient,
  ListClustersCommand,
  DescribeClustersCommand,
  ListServicesCommand,
  DescribeServicesCommand,
  ListTasksCommand,
  DescribeTasksCommand,
  StopTaskCommand,
} from '@aws-sdk/client-ecs';
import {
  ElasticLoadBalancingV2Client,
  DescribeLoadBalancersCommand,
  DescribeTargetGroupsCommand,
  DescribeTargetHealthCommand,
} from '@aws-sdk/client-elastic-load-balancing-v2';
import {
  CloudWatchLogsClient,
  DescribeLogStreamsCommand,
  GetLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import type { AWSCredentials } from '../types/aws';

export class AWSService {
  private ecsClient: ECSClient;
  private elbClient: ElasticLoadBalancingV2Client;
  private logsClient: CloudWatchLogsClient;

  constructor(credentials: AWSCredentials) {
    const config = {
      region: credentials.region,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
    };

    this.ecsClient = new ECSClient(config);
    this.elbClient = new ElasticLoadBalancingV2Client(config);
    this.logsClient = new CloudWatchLogsClient(config);
  }

  async listClusters() {
    const command = new ListClustersCommand({});
    const response = await this.ecsClient.send(command);
    return response.clusterArns || [];
  }

  async describeClusters(clusterArns: string[]) {
    if (clusterArns.length === 0) return [];
    const command = new DescribeClustersCommand({
      clusters: clusterArns,
      include: ['STATISTICS'],
    });
    const response = await this.ecsClient.send(command);
    return response.clusters || [];
  }

  async listServices(clusterArn: string) {
    const command = new ListServicesCommand({
      cluster: clusterArn,
      maxResults: 100,
    });
    const response = await this.ecsClient.send(command);
    return response.serviceArns || [];
  }

  async describeServices(clusterArn: string, serviceArns: string[]) {
    if (serviceArns.length === 0) return [];
    const command = new DescribeServicesCommand({
      cluster: clusterArn,
      services: serviceArns,
      include: ['TAGS'],
    });
    const response = await this.ecsClient.send(command);
    return response.services || [];
  }

  async listTasks(clusterArn: string, serviceName?: string) {
    const command = new ListTasksCommand({
      cluster: clusterArn,
      serviceName: serviceName,
      maxResults: 100,
    });
    const response = await this.ecsClient.send(command);
    return response.taskArns || [];
  }

  async describeTasks(clusterArn: string, taskArns: string[]) {
    if (taskArns.length === 0) return [];
    const command = new DescribeTasksCommand({
      cluster: clusterArn,
      tasks: taskArns,
      include: ['TAGS'],
    });
    const response = await this.ecsClient.send(command);
    return response.tasks || [];
  }

  async stopTask(clusterArn: string, taskArn: string, reason: string = 'Manual restart from dashboard') {
    const command = new StopTaskCommand({
      cluster: clusterArn,
      task: taskArn,
      reason: reason,
    });
    const response = await this.ecsClient.send(command);
    return response.task;
  }

  async listLoadBalancers() {
    const command = new DescribeLoadBalancersCommand({});
    const response = await this.elbClient.send(command);
    return response.LoadBalancers || [];
  }

  async listTargetGroups(loadBalancerArn?: string) {
    const command = new DescribeTargetGroupsCommand({
      LoadBalancerArn: loadBalancerArn,
    });
    const response = await this.elbClient.send(command);
    return response.TargetGroups || [];
  }

  async describeTargetHealth(targetGroupArn: string) {
    const command = new DescribeTargetHealthCommand({
      TargetGroupArn: targetGroupArn,
    });
    const response = await this.elbClient.send(command);
    return response.TargetHealthDescriptions || [];
  }

  async getLogStreams(logGroupName: string) {
    const command = new DescribeLogStreamsCommand({
      logGroupName: logGroupName,
      orderBy: 'LastEventTime',
      descending: true,
      limit: 10,
    });
    const response = await this.logsClient.send(command);
    return response.logStreams || [];
  }

  async getLogEvents(logGroupName: string, logStreamName: string, limit: number = 100) {
    const command = new GetLogEventsCommand({
      logGroupName: logGroupName,
      logStreamName: logStreamName,
      limit: limit,
      startFromHead: false,
    });
    const response = await this.logsClient.send(command);
    return response.events || [];
  }
}
