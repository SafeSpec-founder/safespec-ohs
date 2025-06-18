# Deployment Guide for SafeSpec OHS Application

This guide provides instructions for deploying the SafeSpec OHS application in various environments.

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Docker (for containerized deployment)
- Nginx (for static hosting)

## Environment Configuration

Before deployment, ensure your environment variables are properly configured:

1. Copy the example environment file:

```bash
cp .env.example .env.production
```

2. Edit the `.env.production` file with your production settings:

```
VITE_API_URL=https://api.safespec.com/v1
VITE_AI_ASSISTANT_ENDPOINT=https://ai.safespec.com/api
VITE_ENABLE_ANALYTICS=true
VITE_OFFLINE_STORAGE_LIMIT=50
```

## Deployment Options

### 1. Static Hosting

#### Build the application

```bash
npm install
npm run build
```

This creates a `dist` directory with static files ready for deployment.

#### Deploy to web server

Copy the contents of the `dist` directory to your web server's document root:

```bash
scp -r dist/* user@your-server:/var/www/safespec/
```

#### Nginx Configuration

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/safespec;
    index index.html;

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
}
```

### 2. Docker Deployment

#### Build Docker image

```bash
docker build -t safespec-ohs:latest .
```

#### Run Docker container

```bash
docker run -d -p 80:80 --name safespec-ohs safespec-ohs:latest
```

#### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: "3"
services:
  safespec-ohs:
    build: .
    ports:
      - "80:80"
    restart: always
    environment:
      - NODE_ENV=production
```

Run with Docker Compose:

```bash
docker-compose up -d
```

### 3. Cloud Deployment

#### AWS S3 + CloudFront

1. Build the application

```bash
npm run build
```

2. Upload to S3

```bash
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

3. Configure CloudFront for distribution

#### Azure Static Web Apps

1. Configure GitHub Actions workflow
2. Push to your repository
3. Azure will automatically build and deploy

## Post-Deployment Verification

After deployment, verify the following:

1. Application loads correctly
2. Authentication works
3. API endpoints are accessible
4. Offline functionality works
5. PWA features are available

## Troubleshooting

### Common Issues

1. **Blank page after deployment**

   - Check if the base URL is configured correctly in `vite.config.ts`
   - Ensure server is configured to handle SPA routing

2. **API connection issues**

   - Verify API URL in environment variables
   - Check CORS configuration on API server

3. **Service Worker not registering**
   - Ensure HTTPS is configured correctly
   - Check browser console for errors

## Monitoring and Maintenance

- Set up application monitoring using services like New Relic or Datadog
- Configure error tracking with Sentry
- Establish a regular update schedule for dependencies

## Backup and Recovery

- Regularly backup user data and configurations
- Document recovery procedures for different failure scenarios
- Test recovery processes periodically

## Security Considerations

- Keep all dependencies updated
- Implement Content Security Policy
- Configure proper CORS settings
- Use HTTPS for all communications
- Regularly audit application permissions

For additional support, contact the SafeSpec technical team at support@safespec.com.
