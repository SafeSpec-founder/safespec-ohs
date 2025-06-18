# SafeSpec OHS Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the SafeSpec OHS application to production environments. The application supports multiple deployment strategies including Firebase Hosting, Docker containers, and cloud platforms.

## Prerequisites

### Required Tools

- Node.js 18 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- Git
- Docker (optional, for containerized deployment)

### Required Accounts

- Firebase/Google Cloud Platform account
- GitHub account (for CI/CD)
- Domain name (optional, for custom domain)

## Firebase Deployment (Recommended)

### Step 1: Firebase Project Setup

1. **Create Firebase Project**

   ```bash
   # Login to Firebase
   firebase login

   # Create new project
   firebase projects:create safespec-ohs

   # Select project
   firebase use safespec-ohs
   ```

2. **Enable Required Services**

   ```bash
   # Enable Authentication
   firebase auth:enable

   # Enable Firestore
   firebase firestore:enable

   # Enable Storage
   firebase storage:enable

   # Enable Hosting
   firebase hosting:enable
   ```

3. **Configure Authentication Providers**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Email/Password provider
   - Configure authorized domains

### Step 2: Environment Configuration

1. **Frontend Environment Variables**

   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit with your Firebase configuration
   nano .env
   ```

   Update with your Firebase project details:

   ```env
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=safespec-ohs.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=safespec-ohs
   VITE_FIREBASE_STORAGE_BUCKET=safespec-ohs.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_API_URL=https://us-central1-safespec-ohs.cloudfunctions.net/api
   ```

2. **Backend Environment Variables**
   ```bash
   # Set Cloud Functions configuration
   firebase functions:config:set \
     openai.api_key="your-openai-api-key" \
     sendgrid.api_key="your-sendgrid-api-key" \
     app.environment="production"
   ```

### Step 3: Database Setup

1. **Deploy Firestore Rules and Indexes**

   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

2. **Deploy Storage Rules**

   ```bash
   firebase deploy --only storage
   ```

3. **Initialize Default Data** (Optional)
   ```bash
   # Run data initialization script
   node scripts/init-data.js
   ```

### Step 4: Build and Deploy

1. **Install Dependencies**

   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd functions
   npm install
   cd ..
   ```

2. **Build Application**

   ```bash
   # Build frontend
   npm run build

   # Build functions
   cd functions
   npm run build
   cd ..
   ```

3. **Deploy to Firebase**

   ```bash
   # Deploy everything
   firebase deploy

   # Or deploy specific components
   firebase deploy --only hosting
   firebase deploy --only functions
   ```

### Step 5: Post-Deployment Configuration

1. **Create Admin User**

   ```bash
   # Use Firebase Console or run admin script
   node scripts/create-admin.js
   ```

2. **Configure Custom Domain** (Optional)

   ```bash
   firebase hosting:channel:deploy production --domain your-domain.com
   ```

3. **Set up SSL Certificate**
   - Firebase automatically provides SSL certificates
   - For custom domains, follow Firebase Hosting documentation

## Docker Deployment

### Step 1: Build Docker Image

```bash
# Build production image
docker build -t safespec-ohs:latest .

# Tag for registry
docker tag safespec-ohs:latest your-registry/safespec-ohs:latest
```

### Step 2: Deploy with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f safespec-app
```

### Step 3: Configure Reverse Proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Cloud Platform Deployment

### Google Cloud Platform

1. **Enable Required APIs**

   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable firestore.googleapis.com
   ```

2. **Deploy to Cloud Run**
   ```bash
   # Build and deploy
   gcloud builds submit --tag gcr.io/PROJECT-ID/safespec-ohs
   gcloud run deploy safespec-ohs \
     --image gcr.io/PROJECT-ID/safespec-ohs \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

### AWS Deployment

1. **Using AWS Amplify**

   ```bash
   # Install Amplify CLI
   npm install -g @aws-amplify/cli

   # Initialize Amplify
   amplify init

   # Add hosting
   amplify add hosting

   # Deploy
   amplify publish
   ```

2. **Using AWS ECS**
   ```bash
   # Push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
   docker tag safespec-ohs:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/safespec-ohs:latest
   docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/safespec-ohs:latest
   ```

## CI/CD Setup

### GitHub Actions

1. **Configure Secrets**
   Add the following secrets to your GitHub repository:

   ```
   FIREBASE_SERVICE_ACCOUNT_PRODUCTION
   FIREBASE_SERVICE_ACCOUNT_STAGING
   FIREBASE_API_KEY
   FIREBASE_AUTH_DOMAIN
   FIREBASE_PROJECT_ID
   FIREBASE_STORAGE_BUCKET
   FIREBASE_MESSAGING_SENDER_ID
   FIREBASE_APP_ID
   ```

2. **Workflow Configuration**
   The repository includes pre-configured workflows:

   - `.github/workflows/deploy.yml` - Main deployment workflow
   - `.github/workflows/pr-checks.yml` - Pull request validation

3. **Branch Protection**
   Configure branch protection rules:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

### Deployment Environments

1. **Staging Environment**

   - Automatically deployed from `main` branch
   - Uses Firebase preview channels
   - Includes all features for testing

2. **Production Environment**
   - Deployed from `production` branch
   - Requires manual approval
   - Includes post-deployment verification

## Security Configuration

### SSL/TLS Setup

1. **Firebase Hosting**

   - SSL certificates are automatically provisioned
   - HTTPS is enforced by default

2. **Custom Deployment**
   ```bash
   # Generate SSL certificate with Let's Encrypt
   certbot --nginx -d your-domain.com
   ```

### Security Headers

Configure security headers in your web server:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### Firewall Configuration

1. **Firebase Security Rules**

   - Firestore rules are automatically deployed
   - Storage rules protect file access

2. **Network Security**
   ```bash
   # Configure firewall rules (example for Ubuntu)
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

## Monitoring Setup

### Firebase Monitoring

1. **Enable Performance Monitoring**

   ```javascript
   // Already configured in the application
   import { getPerformance } from "firebase/performance";
   const perf = getPerformance(app);
   ```

2. **Enable Crashlytics**
   ```bash
   firebase crashlytics:enable
   ```

### External Monitoring

1. **Uptime Monitoring**

   - Configure with services like Pingdom, UptimeRobot
   - Monitor critical endpoints

2. **Log Aggregation**
   ```bash
   # Example with ELK stack
   docker run -d --name elasticsearch elasticsearch:7.14.0
   docker run -d --name kibana --link elasticsearch:elasticsearch kibana:7.14.0
   ```

## Backup and Recovery

### Database Backup

1. **Automated Firestore Backup**

   ```bash
   # Schedule daily backups
   gcloud firestore export gs://your-backup-bucket/$(date +%Y-%m-%d)
   ```

2. **Manual Backup**
   ```bash
   # Export specific collections
   firebase firestore:export backup-folder
   ```

### Storage Backup

```bash
# Sync Firebase Storage to backup location
gsutil -m rsync -r -d gs://your-project.appspot.com gs://your-backup-bucket
```

### Recovery Procedures

1. **Database Recovery**

   ```bash
   # Import from backup
   firebase firestore:import backup-folder
   ```

2. **Application Recovery**
   ```bash
   # Rollback to previous version
   firebase hosting:channel:deploy production --version previous
   ```

## Performance Optimization

### Frontend Optimization

1. **Build Optimization**

   ```bash
   # Analyze bundle size
   npm run build -- --analyze

   # Optimize images
   npm run optimize:images
   ```

2. **CDN Configuration**
   - Firebase CDN is automatically configured
   - Consider additional CDN for global performance

### Backend Optimization

1. **Function Optimization**

   ```javascript
   // Use connection pooling
   // Implement caching strategies
   // Optimize cold starts
   ```

2. **Database Optimization**
   - Ensure proper indexing
   - Monitor query performance
   - Implement data archiving

## Troubleshooting

### Common Issues

1. **Build Failures**

   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Deployment Failures**

   ```bash
   # Check Firebase status
   firebase status

   # Verify configuration
   firebase functions:config:get
   ```

3. **Performance Issues**

   ```bash
   # Monitor function performance
   firebase functions:log

   # Check database performance
   # Use Firebase Console performance tab
   ```

### Support Resources

- Firebase Documentation: https://firebase.google.com/docs
- GitHub Issues: Repository issue tracker
- Community Forums: Firebase community support

## Maintenance

### Regular Tasks

1. **Weekly**

   - Review monitoring dashboards
   - Check error logs
   - Verify backup completion

2. **Monthly**

   - Update dependencies
   - Review security alerts
   - Performance optimization review

3. **Quarterly**
   - Security audit
   - Disaster recovery testing
   - Capacity planning review

### Update Procedures

1. **Dependency Updates**

   ```bash
   # Check for updates
   npm outdated

   # Update dependencies
   npm update

   # Test thoroughly before deployment
   npm test
   ```

2. **Security Updates**

   ```bash
   # Audit dependencies
   npm audit

   # Fix vulnerabilities
   npm audit fix
   ```

## Scaling Considerations

### Horizontal Scaling

1. **Firebase Auto-scaling**

   - Functions automatically scale
   - Firestore scales automatically
   - Hosting uses global CDN

2. **Load Balancing**
   ```bash
   # For custom deployments
   # Configure load balancer
   # Implement health checks
   ```

### Vertical Scaling

1. **Function Resources**

   ```javascript
   // Increase memory allocation
   exports.api = functions
     .runWith({ memory: "1GB", timeoutSeconds: 300 })
     .https.onRequest(app);
   ```

2. **Database Performance**
   - Monitor read/write patterns
   - Optimize data structure
   - Implement caching layers

---

This deployment guide provides comprehensive instructions for deploying SafeSpec OHS in various environments. For specific deployment scenarios or troubleshooting, refer to the platform-specific documentation or contact support.
