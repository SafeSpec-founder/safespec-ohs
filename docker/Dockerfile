# Production-Optimized Multi-Stage Dockerfile for SafeSpec OHS PWA
# This Dockerfile creates an optimized production build with security best practices

# ================================
# Stage 1: Build Dependencies
# ================================
FROM node:20-alpine AS dependencies

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S safespec -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files with proper ownership
COPY --chown=safespec:nodejs package*.json ./

# Install dependencies with npm ci for faster, reliable builds
RUN npm ci --only=production --silent && \
    npm cache clean --force

# ================================
# Stage 2: Build Application
# ================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV VITE_BUILD_MODE=production
ENV GENERATE_SOURCEMAP=false

# Build the application
RUN npm run build && \
    npm run test:coverage && \
    npm prune --production

# ================================
# Stage 3: Nginx Production Server
# ================================
FROM nginx:1.25-alpine AS production

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S safespec && \
    adduser -S safespec -u 1001 -G safespec

# Set timezone
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy built application from builder stage
COPY --from=builder --chown=safespec:safespec /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=safespec:safespec nginx.conf /etc/nginx/nginx.conf

# Create nginx directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R safespec:safespec /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /var/run

# Create health check endpoint
RUN echo '<!DOCTYPE html><html><head><title>Health Check</title></head><body><h1>SafeSpec OHS - Healthy</h1><p>Status: OK</p><p>Timestamp: '"$(date)"'</p></body></html>' > /usr/share/nginx/html/health

# Switch to non-root user
USER safespec

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ================================
# Stage 4: Development Server (Optional)
# ================================
FROM node:20-alpine AS development

# Install development dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    git

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S safespec -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=safespec:nodejs package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY --chown=safespec:nodejs . .

# Switch to non-root user
USER safespec

# Expose development port
EXPOSE 3000

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start development server
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ================================
# Metadata and Labels
# ================================
LABEL maintainer="SafeSpec Team <donovansafespec@gmail.com>"
LABEL version="1.0.0"
LABEL description="SafeSpec OHS - Occupational Health & Safety Management PWA"
LABEL org.opencontainers.image.title="SafeSpec OHS"
LABEL org.opencontainers.image.description="Production-ready PWA for occupational health and safety management"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="SafeSpec"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/safespec/ohs-application"
LABEL org.opencontainers.image.documentation="https://docs.safespec.com"

# Security labels
LABEL security.non-root="true"
LABEL security.user="safespec:1001"
LABEL security.capabilities="none"

