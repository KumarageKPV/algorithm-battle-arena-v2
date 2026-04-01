# Deployment Guide

## Quick Start

### Automatic Deployment (Recommended)
1. Push to `main` branch → Automatic production deployment
2. Push to `dev` branch → Build and test only
3. Create PR to `main` → Frontend preview deployment

### Manual Deployment
Use GitHub Actions "Run workflow" button for immediate deployment.

## Prerequisites

### Development Environment
```bash
# Required tools
.NET 8.x SDK
Node.js 20.18.0+
Git
```

### Azure Resources
- Azure Web App Service (Backend)
- Azure Static Web Apps (Frontend)
- Valid publish profiles and API tokens

## Deployment Methods

### 1. Production Deployment

#### Backend API
```bash
# Automatic via GitHub Actions
git push origin main

# Manual via Azure CLI
az webapp deployment source config-zip \
  --resource-group <resource-group> \
  --name AlgorithmBattleArena \
  --src <path-to-zip>
```

#### Frontend
```bash
# Automatic via GitHub Actions
git push origin main

# Manual via Static Web Apps CLI
cd AlgorithmBattleArenaFrontend
npm run build
swa deploy dist --env production
```

### 2. Local Development

#### Backend Setup
```bash
cd AlgorithmBattleArena
cp .env.example .env
# Configure database connection
dotnet run
```

#### Frontend Setup
```bash
cd AlgorithmBattleArenaFrontend
npm install
npm run dev
```

### 3. Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY . .
EXPOSE 80
ENTRYPOINT ["dotnet", "AlgorithmBattleArena.dll"]
```

#### Docker Commands
```bash
# Build and run
docker build -t algorithm-battle-arena .
docker run -p 8080:80 algorithm-battle-arena
```

## Environment Configuration

### Backend (.env)
```env
DATABASE_CONNECTION_STRING=<connection-string>
JWT_SECRET=<jwt-secret>
OPENAI_API_KEY=<api-key>
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://algorithmbattlearena.azurewebsites.net
```

## Database Setup

### SQL Server Setup
```sql
-- Run DATABASE_AlgorithmBattleArina.sql
-- Seed data from data/seeds/
```

### Connection String Format
```
Server=<server>;Database=<database>;User Id=<user>;Password=<password>;
```

## Troubleshooting

### Common Issues
- **Build fails**: Check .NET version compatibility
- **Tests fail**: Verify test configuration files
- **Deployment timeout**: Check Azure service status
- **Database connection**: Verify connection string format

### Debug Commands
```bash
# Backend
dotnet build --verbosity detailed
dotnet test --logger console

# Frontend
npm run build
npm run preview
```

## Rollback Procedures

### Quick Rollback
1. Azure Portal → App Services → Deployment History
2. Select previous version → Redeploy

### Git Rollback
```bash
git revert <commit-hash>
git push origin main
```

## Monitoring

### Health Checks
- Backend: `https://algorithmbattlearena.azurewebsites.net/health`
- Frontend: `https://lemon-mud-0cd08c100.azurestaticapps.net`

### Logs
- Azure Application Insights
- GitHub Actions workflow logs
- Azure App Service logs

---

**For detailed CI/CD pipeline information, see [CI/CD Pipeline Documentation](cicd_pipeline_documentation.md)**