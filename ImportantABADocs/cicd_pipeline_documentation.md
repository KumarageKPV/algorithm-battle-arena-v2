# CI/CD Pipeline Documentation

## Overview

The Algorithm Battle Arena project uses GitHub Actions for continuous integration and deployment with two main workflows targeting different components of the application.

## Pipeline Architecture
         💻 Source Code (GitHub)
        ┌────────────────────────┐
                 GitHub          
        │        Repo 📂          
        └───────────┬────────────┘
                    │ Push / PR
                    ▼
        ┌────────────────────────┐
            GitHub Actions ⚙️     
             CI/CD Workflow       
        └───────────┬────────────┘
                    │ Build / Deploy
                    ▼
        ┌────────────────────────┐
              Azure Cloud ☁️      
            App Deployment 🚀     
        └────────────────────────┘


## Workflows

### 1. Backend API Pipeline (`dev_algorithmbattlearena.yml`)

**Triggers:**
- Push to `main` or `dev` branches
- Manual workflow dispatch

**Workflow Steps:**

#### Build and Test Job
1. **Environment Setup**
   - Ubuntu latest runner
   - .NET 8.x SDK installation
   - Repository checkout

2. **Build Process**
   ```yaml
   - Restore NuGet dependencies
   - Build in Release configuration
   - Create test output directories
   - Copy test configuration files
   ```

3. **Testing Phase**
   ```yaml
   - Run unit tests with TRX logger
   - Generate test results in ./TestResults
   - Upload test artifacts for analysis
   ```

4. **Publish Artifacts** (main branch only)
   ```yaml
   - Publish .NET application
   - Upload deployment artifacts
   ```

#### Deploy Job
- **Condition:** Only runs on `main` branch after successful build
- **Process:**
  1. Download build artifacts
  2. Deploy to Azure Web App using publish profile
  3. Target: Production slot

### 2. Frontend Pipeline (`azure-static-web-apps-lemon-mud-0cd08c100.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Workflow Steps:**

#### Build and Deploy Job
1. **Environment Setup**
   - Ubuntu latest runner
   - Node.js 20.18.0 with npm caching
   - Repository checkout with submodules

2. **Authentication**
   ```yaml
   - Install OIDC client packages
   - Generate GitHub ID token
   - Configure Azure authentication
   ```

3. **Deployment**
   ```yaml
   - Deploy to Azure Static Web Apps
   - App location: ./AlgorithmBattleArenaFrontend
   - Output location: dist
   - Build and deploy frontend assets
   ```

#### Pull Request Cleanup Job
- **Condition:** Runs when PR is closed
- **Process:** Clean up preview deployments

## Tools & Integrations

### Primary CI/CD Platform
- **GitHub Actions**
  - Native GitHub integration
  - YAML-based workflow configuration
  - Built-in secrets management
  - Artifact storage and management

### Cloud Deployment Targets
- **Azure Web Apps** (Backend API)
  - Production slot deployment
  - Publish profile authentication
  - Automatic scaling capabilities

- **Azure Static Web Apps** (Frontend)
  - Global CDN distribution
  - Automatic HTTPS
  - Preview deployments for PRs

### Development Tools Integration
- **.NET 8.x SDK**
  - Cross-platform runtime
  - Built-in testing framework
  - Package management via NuGet

- **Node.js 20.18.0**
  - Frontend build tooling
  - NPM package management
  - Dependency caching

### Testing & Quality Assurance
- **Unit Testing**
  - .NET Test framework
  - TRX result format
  - Automated test execution
  - Test result artifacts

## Secrets & Credentials Management

### GitHub Secrets Configuration

#### Azure Static Web Apps
```
AZURE_STATIC_WEB_APPS_API_TOKEN_LEMON_MUD_0CD08C100
├── Purpose: Azure Static Web Apps deployment
├── Type: API Token
└── Usage: Frontend deployment authentication
```

#### Azure Web App Service
```
AZUREAPPSERVICE_PUBLISHPROFILE_BD81C951B4754D6ABD5FD7AE9379497A
├── Purpose: Azure Web App deployment
├── Type: Publish Profile (XML)
├── Contains: Deployment credentials, endpoints, settings
└── Usage: Backend API deployment authentication
```

### Security Best Practices

#### Secret Management
- **Storage:** GitHub repository secrets (encrypted at rest)
- **Access:** Limited to workflow execution context
- **Rotation:** Regular credential rotation recommended
- **Scope:** Repository-level access control

#### Authentication Methods
- **OIDC Integration:** GitHub-Azure federated identity
- **Publish Profiles:** Azure-generated deployment credentials
- **API Tokens:** Service-specific authentication tokens

#### Security Measures
```yaml
permissions:
  id-token: write    # OIDC token generation
  contents: read     # Repository access
```

## Deployment Environments

### Production Environment
- **Backend:** Azure Web App Service
  - URL: `https://algorithmbattlearena.azurewebsites.net`
  - Slot: Production
  - Auto-scaling enabled

- **Frontend:** Azure Static Web Apps
  - URL: `https://lemon-mud-0cd08c100.azurestaticapps.net`
  - Global CDN distribution
  - Custom domain support

### Development Environment
- **Branch:** `dev`
- **Process:** Build and test only (no deployment)
- **Purpose:** Integration testing and validation

## Rollback Procedures

### Automated Rollback Triggers
- **Build Failures:** Pipeline stops, no deployment occurs
- **Test Failures:** Deployment blocked until tests pass
- **Deployment Failures:** Azure handles automatic rollback

### Manual Rollback Options

#### Backend API Rollback
1. **Azure Portal Method:**
   ```
   Azure Portal → App Services → AlgorithmBattleArena
   → Deployment Center → Deployment History
   → Select previous successful deployment → Redeploy
   ```

2. **GitHub Actions Method:**
   ```
   Actions → Select previous successful workflow
   → Re-run deployment job
   ```

#### Frontend Rollback
1. **Azure Static Web Apps:**
   ```
   Azure Portal → Static Web Apps → Deployments
   → Select previous version → Activate
   ```

2. **Git-based Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

### Rollback Verification
- **Health Checks:** Automated endpoint monitoring
- **Smoke Tests:** Basic functionality validation
- **User Acceptance:** Stakeholder verification

## Monitoring & Notifications

### Pipeline Monitoring
- **GitHub Actions Dashboard:** Real-time workflow status
- **Email Notifications:** Failure alerts to repository maintainers
- **Slack Integration:** Optional team notifications

### Application Monitoring
- **Azure Application Insights:** Performance and error tracking
- **Azure Monitor:** Infrastructure health monitoring
- **Custom Dashboards:** Business metrics visualization

## Workflow Optimization

### Performance Improvements
- **Dependency Caching:** NPM and NuGet package caching
- **Parallel Jobs:** Independent build and test execution
- **Artifact Reuse:** Build once, deploy multiple times

### Cost Optimization
- **Conditional Deployments:** Deploy only on main branch
- **Resource Cleanup:** Automatic PR environment cleanup
- **Efficient Runners:** Ubuntu latest for cost-effectiveness

## Troubleshooting Guide

### Common Issues

#### Build Failures
```yaml
Issue: Dependency restoration fails
Solution: Clear cache, update package versions
Command: dotnet clean && dotnet restore
```

#### Test Failures
```yaml
Issue: Unit tests fail in CI but pass locally
Solution: Check test configuration files, environment variables
Action: Verify appsettings.test.json deployment
```

#### Deployment Failures
```yaml
Issue: Azure deployment timeout
Solution: Check publish profile validity, Azure service status
Action: Regenerate publish profile if expired
```

### Debug Commands
```bash
# Local build verification
dotnet build --configuration Release --verbosity detailed

# Local test execution
dotnet test --logger "console;verbosity=detailed"

# Frontend build verification
cd AlgorithmBattleArenaFrontend
npm install
npm run build
```

## Maintenance Schedule

### Regular Tasks
- **Weekly:** Review pipeline performance metrics
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Credential rotation and security audit
- **Annually:** Infrastructure cost optimization review

### Upgrade Path
- **GitHub Actions:** Automatic runner updates
- **Azure Services:** Managed service updates
- **Dependencies:** Dependabot automated PRs
- **.NET Framework:** Major version upgrades as needed

---

**Last Updated:** December 2024  
**Document Version:** 1.0  
**Maintained By:** DevOps Team