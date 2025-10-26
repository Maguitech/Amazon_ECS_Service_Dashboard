# =� AWS ECS Dashboard - Quick Start

## � Start in 3 Steps

### 1� Install Dependencies (First Time Only)
```cmd
cd aws-ecs-dashboard
npm install
```
� Takes ~30 seconds

### 2� Start the Dashboard
```cmd
start.bat
```
< Opens automatically at `http://localhost:5173`

### 3� Enter AWS Credentials
When the app opens:
- Access Key ID: `AKIA...`
- Secret Access Key: `wJal...`
- Region: `us-east-1` (or your region)

 Done! Start monitoring your ECS infrastructure

---

## =� Need More Help?

- **Detailed Setup**: [SETUP-GUIDE.md](SETUP-GUIDE.md)
- **IAM Permissions**: [iam-policy.json](iam-policy.json)
- **Full Documentation**: [README.md](README.md)

---

## <� What You Can Do

| Feature | Action |
|---------|--------|
| <� **View Clusters** | Click any cluster to see services |
| =� **Monitor Services** | Check running tasks and health |
| = **Restart Tasks** | Click "View Tasks" � "Restart" |
| � **Load Balancers** | Expand to see target health |
| =� **View Logs** | Click "View Logs" � Enter log group |
| � **Auto-refresh** | Toggle to update every 30s |

---

## � Troubleshooting

**Can't see your clusters?**
-  Check you selected the correct AWS region
-  Verify IAM permissions (see `iam-policy.json`)
-  Confirm clusters exist in that region

**Credentials not working?**
-  Check for typos in Access Key ID / Secret Key
-  Verify the user has required permissions
-  Try regenerating credentials in AWS Console

**Build errors?**
```cmd
rmdir /s node_modules
del package-lock.json
npm install
```

---

## = Security Tip

**Always logout when done!** Click the "Logout" button to clear stored credentials.

---

**Happy Monitoring! <�**
