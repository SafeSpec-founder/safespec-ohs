# Multi-stage build for SafeSpec OHS Application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install dependencies
RUN npm ci --only=production
RUN cd functions && npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Build functions
RUN cd functions && npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S safespec -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=safespec:nodejs /app/dist ./dist
COPY --from=builder --chown=safespec:nodejs /app/functions/lib ./functions/lib
COPY --from=builder --chown=safespec:nodejs /app/functions/package*.json ./functions/
COPY --from=builder --chown=safespec:nodejs /app/package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd functions && npm ci --only=production && npm cache clean --force

# Install serve for static file serving
RUN npm install -g serve

# Switch to non-root user
USER safespec

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["serve", "-s", "dist", "-l", "3000"]

