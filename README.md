# AWS ECS Dashboard

🚀 Professional web dashboard for monitoring AWS ECS infrastructure, load balancers, and CloudWatch logs.

![Dashboard](https://img.shields.io/badge/AWS-ECS-orange?style=for-the-badge&logo=amazon-aws)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=for-the-badge&logo=vite)

## ✨ Features

- 📊 **Real-time ECS Monitoring**: View clusters, services, and tasks
- ⚖️ **Load Balancer Health**: Monitor ALB/NLB status and target health
- 📋 **CloudWatch Logs**: View and search container logs
- 🔄 **Task Management**: Restart tasks directly from the dashboard
- ⏱️ **Auto-refresh**: Automatically update data every 30 seconds
- 🔒 **Secure**: Credentials stored locally in browser

## 📋 Prerequisites

- Node.js 22+ and npm
- AWS Account with appropriate IAM permissions

## 🚀 Quick Start (Windows)

### 1. Installation

```cmd
cd aws-ecs-dashboard
npm install
```

### 2. Start the Dashboard

**Option A: Use the provided script**
```cmd
start.bat
```

**Option B: Manual command**
```cmd
npm run dev
```

The application will open at `http://localhost:5173`

### 3. Configure AWS Credentials

When you first open the app, enter:
- **Access Key ID**
- **Secret Access Key**
- **AWS Region** (e.g., us-east-1)

See [SETUP-GUIDE.md](SETUP-GUIDE.md) for detailed setup instructions.

## 🔐 Required IAM Permissions

Your AWS user needs specific permissions. Use the policy file provided: [iam-policy.json](iam-policy.json)

**Quick Summary:**
- ✅ ECS: List/Describe clusters, services, and tasks + Stop tasks
- ✅ ELB: Describe load balancers, target groups, and health
- ✅ CloudWatch Logs: Describe and read log events

See [SETUP-GUIDE.md](SETUP-GUIDE.md) for step-by-step IAM user creation.

## 🛠️ Available Commands

### Development

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `start.bat` | Windows quick start script |

### Docker Deployment

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Build and start container |
| `docker-compose logs -f` | View container logs |
| `docker-compose down` | Stop and remove container |
| `docker-start.bat` | Windows Docker quick start |

📦 **Docker Port**: 5000 | See [DOCKER-GUIDE.md](DOCKER-GUIDE.md) for full Docker documentation

## 📖 Usage Guide

### 🏢 Monitoring Clusters & Services

1. **Select a Cluster**: Click on any cluster card to view its services
2. **View Service Details**: Each service shows:
   - Current status (ACTIVE, DRAINING, etc.)
   - Running tasks vs desired count
   - Load balancer associations
3. **Inspect Tasks**: Click "View Tasks" to see individual containers

### ⚖️ Load Balancers

- View all Application and Network Load Balancers
- Click to expand and see:
  - Target Groups
  - Health Check configuration
  - Target health status (healthy/unhealthy)
- Real-time health monitoring

### 🔄 Task Management

1. Click "View Tasks" on any service
2. See detailed task information (CPU, memory, containers)
3. Restart tasks with the "Restart" button
4. ECS automatically launches replacement tasks

### 📋 CloudWatch Logs

1. Click "View Logs" in the top bar
2. Enter your log group name (e.g., `/ecs/my-app-name`)
3. Select a log stream
4. View real-time logs with timestamps

### ⏱️ Auto-Refresh

Enable "Auto-refresh (30s)" to automatically update all data every 30 seconds.

## 🔒 Security Best Practices

- 🔐 Credentials stored locally in browser (localStorage)
- ⚠️ Never commit credentials to source control
- 👤 Use IAM users with minimal required permissions
- 🎫 Consider using temporary credentials (AWS STS)
- 🚪 Click "Logout" when finished to clear credentials

## 🏗️ Tech Stack

- ⚛️ **React 18** - UI Framework
- 📘 **TypeScript** - Type Safety
- ⚡ **Vite** - Build Tool
- ☁️ **AWS SDK v3** - AWS Integration
- 🎨 **CSS3** - Modern Gradients & Animations

## 📂 Project Structure

```
aws-ecs-dashboard/
├── src/
│   ├── components/       # React components
│   │   ├── ClusterCard.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── LoadBalancerCard.tsx
│   │   ├── TasksModal.tsx
│   │   ├── LogsModal.tsx
│   │   └── Dashboard.tsx
│   ├── contexts/         # React context (AWS credentials)
│   ├── services/         # AWS service integration
│   ├── types/           # TypeScript type definitions
│   └── App.tsx          # Main application
├── iam-policy.json      # IAM policy template
├── SETUP-GUIDE.md       # Detailed setup instructions
├── start.bat            # Windows startup script
└── README.md           # This file
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| ❌ Access Denied | Verify IAM permissions and credentials |
| 🔍 No clusters visible | Check selected AWS region |
| 📋 Logs not loading | Verify log group name format: `/ecs/service-name` |
| 🚫 Build errors | Run `npm install` again |

For detailed troubleshooting, see [SETUP-GUIDE.md](SETUP-GUIDE.md)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! This dashboard is designed for:
- ✅ Mobile app backend monitoring
- ✅ ECS Fargate deployments
- ✅ Load-balanced applications
- ✅ Production monitoring and debugging

---

**Made with ❤️ for the comunity**
