# SafeSpec OHS Docker Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the SafeSpec OHS Progressive Web Application using Docker and Docker Compose. The configuration includes production-ready optimizations, security hardening, monitoring, and scalability features.

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Git (for version control)
- 4GB+ RAM and 20GB+ disk space
- Linux/macOS/Windows with WSL2

### Basic Deployment

```bash
# Clone the repository
git clone <repository-url>
cd safespec-ohs

# Copy environment template
cp .env.template .env

# Edit environment variables
nano .env

# Deploy basic setup
./deploy.sh deploy basic
```

The application will be available at `http://localhost:8080`

## 📋 Configuration Files

### Core Files

| File                           | Purpose                      | Description                                     |
| ------------------------------ | ---------------------------- | ----------------------------------------------- |
| `Dockerfile.optimized`         | Multi-stage production build | Optimized Docker image with security hardening  |
| `docker-compose.optimized.yml` | Service orchestration        | Complete stack with monitoring and security     |
| `nginx.conf.optimized`         | Web server configuration     | Production-ready Nginx with PWA support         |
| `.env.template`                | Environment variables        | Configuration template for all services         |
| `deploy.sh`                    | Deployment automation        | Production deployment script with health checks |

### Supporting Files

| File                        | Purpose                 |
| --------------------------- | ----------------------- |
| `.dockerignore.optimized`   | Build optimization      |
| `monitoring/prometheus.yml` | Metrics collection      |
| `monitoring/grafana/`       | Dashboard configuration |
| `scripts/backup.sh`         | Automated backup system |

## 🏗️ Architecture

### Multi-Stage Docker Build

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dependencies  │───▶│     Builder     │───▶│   Production    │
│   (Node 20)     │    │   (Build App)   │    │   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Traefik   │  │ SafeSpec    │  │      Nginx          │  │
│  │ (Proxy/SSL) │  │    App      │  │  (Static Files)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        Backend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Redis    │  │ PostgreSQL  │  │      Backup         │  │
│  │   (Cache)   │  │ (Database)  │  │    (Automated)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      Monitoring                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Prometheus  │  │   Grafana   │  │       Loki          │  │
│  │ (Metrics)   │  │(Dashboards) │  │      (Logs)         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Deployment Profiles

### Basic Profile (Default)

- SafeSpec OHS Application
- Redis Cache
- Minimal resource usage

```bash
./deploy.sh deploy basic
```

### Production Profile

- All basic services
- Traefik reverse proxy with SSL
- Enhanced security headers
- Load balancing ready

```bash
./deploy.sh deploy production
```

### Monitoring Profile

- All production services
- Prometheus metrics collection
- Grafana dashboards
- Loki log aggregation
- Promtail log collection

```bash
./deploy.sh deploy monitoring
```

### Full Profile

- All monitoring services
- PostgreSQL database
- Fail2Ban security
- Automated backups
- Complete enterprise stack

```bash
./deploy.sh deploy full
```

## ⚙️ Environment Configuration

### Required Variables

```bash
# Application
APP_PORT=8080
DOMAIN=your-domain.com

# Firebase (Required)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Security (Required)
POSTGRES_PASSWORD=secure-password
REDIS_PASSWORD=secure-redis-password
GRAFANA_ADMIN_PASSWORD=secure-grafana-password
```

### Optional Variables

```bash
# API Configuration
VITE_API_URL=https://api.safespec.com/v1
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=true

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
LOKI_PORT=3100

# Backup
BACKUP_SCHEDULE=0 2 * * *
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
BACKUP_BUCKET=your-backup-bucket
```

## 🔒 Security Features

### Container Security

- **Non-root user**: All containers run as non-privileged users
- **Read-only filesystem**: Containers use read-only root filesystem
- **No new privileges**: Prevents privilege escalation
- **Resource limits**: CPU and memory constraints
- **Security options**: AppArmor/SELinux profiles

### Network Security

- **Isolated networks**: Frontend, backend, and monitoring networks
- **Internal communication**: Backend services not exposed externally
- **Firewall rules**: Fail2Ban integration for intrusion prevention

### Application Security

- **Security headers**: HSTS, CSP, X-Frame-Options, etc.
- **SSL/TLS**: Automatic certificate management with Let's Encrypt
- **Rate limiting**: API and login endpoint protection
- **Content Security Policy**: Strict CSP for XSS prevention

## 📊 Monitoring & Observability

### Metrics (Prometheus)

- Application performance metrics
- Container resource usage
- HTTP request metrics
- Custom business metrics

### Dashboards (Grafana)

- Application overview dashboard
- Infrastructure monitoring
- Security incident tracking
- Performance analytics

### Logging (Loki)

- Centralized log aggregation
- Application logs
- Access logs
- Error tracking

### Health Checks

- Application health endpoints
- Database connectivity
- Cache availability
- Service dependency checks

## 🔄 Backup & Recovery

### Automated Backups

- **Schedule**: Daily at 2 AM (configurable)
- **Retention**: 30 days (configurable)
- **Storage**: Local and AWS S3
- **Compression**: Gzip compression for efficiency

### Backup Components

- PostgreSQL database dumps
- Redis data snapshots
- Application logs
- Configuration files

### Recovery Procedures

```bash
# Restore from backup
./deploy.sh backup
docker-compose exec postgres psql -U safespec -d safespec < backup.sql
```

## 🚀 Deployment Commands

### Basic Operations

```bash
# Deploy application
./deploy.sh deploy [profile]

# Stop all services
./deploy.sh stop

# Restart services
./deploy.sh restart

# View service status
./deploy.sh status

# View logs
./deploy.sh logs [service-name]
```

### Maintenance Operations

```bash
# Update application
./deploy.sh update

# Run backup
./deploy.sh backup

# Scale services
docker-compose up -d --scale safespec-app=3
```

## 🔍 Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check logs
./deploy.sh logs safespec-app

# Check environment variables
docker-compose config

# Verify health checks
curl http://localhost:8080/health
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
./deploy.sh logs postgres

# Test connection
docker-compose exec postgres pg_isready -U safespec
```

#### SSL Certificate Issues

```bash
# Check Traefik logs
./deploy.sh logs traefik

# Verify domain configuration
docker-compose exec traefik traefik version
```

### Performance Optimization

#### Resource Monitoring

```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h
docker system df
```

#### Scaling

```bash
# Scale application instances
docker-compose up -d --scale safespec-app=3

# Add load balancer
# Configure Traefik for multiple instances
```

## 📈 Performance Tuning

### Application Optimization

- **Nginx caching**: Static asset caching with long expiry
- **Gzip compression**: Reduced bandwidth usage
- **HTTP/2**: Modern protocol support
- **Resource limits**: Optimal CPU/memory allocation

### Database Optimization

- **Connection pooling**: Efficient database connections
- **Query optimization**: Indexed queries
- **Backup scheduling**: Off-peak backup timing

### Monitoring Optimization

- **Metric retention**: Configurable data retention
- **Dashboard efficiency**: Optimized Grafana queries
- **Log rotation**: Automated log cleanup

## 🌐 Production Deployment

### Cloud Platforms

#### AWS Deployment

```bash
# Using ECS
aws ecs create-cluster --cluster-name safespec-cluster
aws ecs create-service --cluster safespec-cluster --service-name safespec-app

# Using EC2
# Deploy to EC2 instance with Docker installed
scp -r . ec2-user@your-instance:/opt/safespec
ssh ec2-user@your-instance "cd /opt/safespec && ./deploy.sh deploy production"
```

#### Google Cloud Platform

```bash
# Using Cloud Run
gcloud builds submit --tag gcr.io/PROJECT-ID/safespec-ohs
gcloud run deploy --image gcr.io/PROJECT-ID/safespec-ohs --platform managed
```

#### Azure Deployment

```bash
# Using Container Instances
az container create --resource-group myResourceGroup --name safespec-ohs --image safespec/ohs-app:latest
```

### Domain Configuration

1. Point your domain to the server IP
2. Update `DOMAIN` in `.env` file
3. Restart services: `./deploy.sh restart`
4. SSL certificates will be automatically provisioned

## 🔐 Security Checklist

### Pre-Deployment

- [ ] Change all default passwords
- [ ] Configure Firebase security rules
- [ ] Set up proper domain and SSL
- [ ] Configure backup storage
- [ ] Review environment variables

### Post-Deployment

- [ ] Verify SSL certificate installation
- [ ] Test application functionality
- [ ] Check monitoring dashboards
- [ ] Verify backup system
- [ ] Review security logs

## 📞 Support & Maintenance

### Regular Maintenance Tasks

#### Weekly

- [ ] Review monitoring dashboards
- [ ] Check error logs
- [ ] Verify backup completion
- [ ] Update security patches

#### Monthly

- [ ] Update Docker images
- [ ] Review resource usage
- [ ] Performance optimization
- [ ] Security audit

#### Quarterly

- [ ] Disaster recovery testing
- [ ] Capacity planning
- [ ] Security penetration testing
- [ ] Documentation updates

### Getting Help

1. **Documentation**: Check this guide and inline comments
2. **Logs**: Use `./deploy.sh logs` for troubleshooting
3. **Monitoring**: Check Grafana dashboards for insights
4. **Community**: GitHub issues and discussions

## 📝 License & Contributing

This Docker configuration is part of the SafeSpec OHS application. Please refer to the main project documentation for licensing and contribution guidelines.

---

**Note**: This deployment configuration is production-ready but should be customized based on your specific requirements, security policies, and infrastructure constraints.
