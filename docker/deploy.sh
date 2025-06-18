#!/bin/bash
# SafeSpec OHS Docker Deployment Script
# Production-ready deployment with security checks and monitoring

set -euo pipefail

# ================================
# CONFIGURATION
# ================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="safespec-ohs"
COMPOSE_FILE="docker-compose.optimized.yml"
ENV_FILE=".env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ================================
# HELPER FUNCTIONS
# ================================
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# ================================
# PREREQUISITE CHECKS
# ================================
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not available. Please install Docker Compose."
    fi
    
    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        warning "Environment file $ENV_FILE not found. Creating from template..."
        if [[ -f ".env.template" ]]; then
            cp .env.template "$ENV_FILE"
            warning "Please edit $ENV_FILE with your actual configuration values."
            read -p "Press Enter to continue after editing the environment file..."
        else
            error "No environment template found. Please create $ENV_FILE manually."
        fi
    fi
    
    success "Prerequisites check completed"
}

# ================================
# SECURITY CHECKS
# ================================
security_check() {
    log "Performing security checks..."
    
    # Check for default passwords
    if grep -q "your-secure-password\|your-redis-password\|your-grafana-password" "$ENV_FILE"; then
        error "Default passwords detected in $ENV_FILE. Please change all default passwords."
    fi
    
    # Check for empty critical variables
    source "$ENV_FILE"
    
    if [[ -z "${POSTGRES_PASSWORD:-}" ]]; then
        error "POSTGRES_PASSWORD is not set in $ENV_FILE"
    fi
    
    if [[ -z "${REDIS_PASSWORD:-}" ]]; then
        error "REDIS_PASSWORD is not set in $ENV_FILE"
    fi
    
    # Check file permissions
    if [[ "$(stat -c %a "$ENV_FILE")" != "600" ]]; then
        warning "Environment file permissions are too open. Fixing..."
        chmod 600 "$ENV_FILE"
    fi
    
    success "Security checks completed"
}

# ================================
# DIRECTORY SETUP
# ================================
setup_directories() {
    log "Setting up directories..."
    
    # Create data directories
    mkdir -p data/{postgres,redis,prometheus,grafana,loki}
    mkdir -p logs
    mkdir -p monitoring/{prometheus,grafana,loki}
    mkdir -p scripts
    mkdir -p ssl
    
    # Set proper permissions
    chmod 755 data logs monitoring scripts
    chmod 700 ssl
    
    # Create monitoring configuration files if they don't exist
    if [[ ! -f "monitoring/prometheus.yml" ]]; then
        cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'safespec-app'
    static_configs:
      - targets: ['safespec-app:8080']
    metrics_path: '/metrics'
    scrape_interval: 30s
EOF
    fi
    
    success "Directory setup completed"
}

# ================================
# BUILD AND DEPLOY
# ================================
build_and_deploy() {
    local profile="${1:-basic}"
    
    log "Building and deploying with profile: $profile"
    
    # Set build arguments
    export BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
    export VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    # Build the application
    log "Building Docker images..."
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" build --no-cache
    else
        docker compose -f "$COMPOSE_FILE" build --no-cache
    fi
    
    # Deploy based on profile
    case "$profile" in
        "basic")
            log "Deploying basic setup (app + redis)..."
            docker-compose -f "$COMPOSE_FILE" up -d safespec-app redis
            ;;
        "production")
            log "Deploying production setup..."
            docker-compose -f "$COMPOSE_FILE" --profile production up -d
            ;;
        "monitoring")
            log "Deploying with monitoring..."
            docker-compose -f "$COMPOSE_FILE" --profile production --profile monitoring up -d
            ;;
        "full")
            log "Deploying full stack..."
            docker-compose -f "$COMPOSE_FILE" --profile production --profile monitoring --profile database --profile security up -d
            ;;
        *)
            error "Unknown profile: $profile. Available profiles: basic, production, monitoring, full"
            ;;
    esac
    
    success "Deployment completed"
}

# ================================
# HEALTH CHECKS
# ================================
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check main application
    if curl -f http://localhost:${APP_PORT:-8080}/health &> /dev/null; then
        success "SafeSpec OHS application is healthy"
    else
        error "SafeSpec OHS application health check failed"
    fi
    
    # Check Redis if running
    if docker ps --format "table {{.Names}}" | grep -q "safespec-redis"; then
        if docker exec safespec-redis redis-cli ping | grep -q "PONG"; then
            success "Redis is healthy"
        else
            warning "Redis health check failed"
        fi
    fi
    
    # Check PostgreSQL if running
    if docker ps --format "table {{.Names}}" | grep -q "safespec-postgres"; then
        if docker exec safespec-postgres pg_isready -U safespec &> /dev/null; then
            success "PostgreSQL is healthy"
        else
            warning "PostgreSQL health check failed"
        fi
    fi
    
    success "Health checks completed"
}

# ================================
# MONITORING SETUP
# ================================
setup_monitoring() {
    log "Setting up monitoring dashboards..."
    
    # Wait for Grafana to start
    sleep 60
    
    # Import dashboards (if Grafana is running)
    if docker ps --format "table {{.Names}}" | grep -q "safespec-grafana"; then
        log "Grafana is running. Dashboards will be auto-imported from provisioning."
        success "Monitoring setup completed"
    fi
}

# ================================
# BACKUP SETUP
# ================================
setup_backup() {
    log "Setting up backup system..."
    
    # Create backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"

# Backup PostgreSQL
if [ -d "$BACKUP_DIR/postgres" ]; then
    pg_dump -h postgres -U safespec safespec | gzip > "$BACKUP_DIR/postgres_$BACKUP_DATE.sql.gz"
fi

# Backup Redis
if [ -d "$BACKUP_DIR/redis" ]; then
    redis-cli --rdb "$BACKUP_DIR/redis_$BACKUP_DATE.rdb"
fi

# Upload to S3 (if configured)
if [ -n "${BACKUP_BUCKET:-}" ]; then
    aws s3 sync "$BACKUP_DIR" "s3://$BACKUP_BUCKET/safespec-backups/"
fi

# Cleanup old backups
find "$BACKUP_DIR" -name "*.gz" -o -name "*.rdb" -mtime +${BACKUP_RETENTION:-30} -delete
EOF
    
    chmod +x scripts/backup.sh
    success "Backup setup completed"
}

# ================================
# MAIN FUNCTION
# ================================
main() {
    local command="${1:-deploy}"
    local profile="${2:-basic}"
    
    case "$command" in
        "deploy")
            check_prerequisites
            security_check
            setup_directories
            build_and_deploy "$profile"
            health_check
            if [[ "$profile" == "monitoring" || "$profile" == "full" ]]; then
                setup_monitoring
            fi
            setup_backup
            
            success "SafeSpec OHS deployment completed successfully!"
            log "Application is available at: http://localhost:${APP_PORT:-8080}"
            
            if [[ "$profile" == "monitoring" || "$profile" == "full" ]]; then
                log "Grafana dashboard: http://localhost:${GRAFANA_PORT:-3001}"
                log "Prometheus: http://localhost:${PROMETHEUS_PORT:-9090}"
            fi
            ;;
        "stop")
            log "Stopping all services..."
            docker-compose -f "$COMPOSE_FILE" down
            success "All services stopped"
            ;;
        "restart")
            log "Restarting services..."
            docker-compose -f "$COMPOSE_FILE" restart
            health_check
            success "Services restarted"
            ;;
        "logs")
            docker-compose -f "$COMPOSE_FILE" logs -f "${2:-safespec-app}"
            ;;
        "status")
            docker-compose -f "$COMPOSE_FILE" ps
            ;;
        "backup")
            log "Running manual backup..."
            docker-compose -f "$COMPOSE_FILE" --profile backup run --rm backup /backup.sh
            success "Backup completed"
            ;;
        "update")
            log "Updating application..."
            docker-compose -f "$COMPOSE_FILE" pull
            docker-compose -f "$COMPOSE_FILE" up -d
            health_check
            success "Update completed"
            ;;
        *)
            echo "Usage: $0 {deploy|stop|restart|logs|status|backup|update} [profile]"
            echo ""
            echo "Commands:"
            echo "  deploy [profile]  - Deploy the application (profiles: basic, production, monitoring, full)"
            echo "  stop             - Stop all services"
            echo "  restart          - Restart all services"
            echo "  logs [service]   - Show logs for a service"
            echo "  status           - Show service status"
            echo "  backup           - Run manual backup"
            echo "  update           - Update and restart services"
            echo ""
            echo "Examples:"
            echo "  $0 deploy basic      - Deploy basic setup"
            echo "  $0 deploy production - Deploy production setup with Traefik"
            echo "  $0 deploy full       - Deploy full stack with monitoring"
            echo "  $0 logs safespec-app - Show application logs"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"

