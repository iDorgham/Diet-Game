# Multi-stage Docker build for production following Level 404 requirements
# Optimized for security, performance, and minimal attack surface

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./
COPY vite.config.prod.js ./vite.config.js

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_VERSION
ARG REACT_APP_BUILD_TIME
ARG REACT_APP_SENTRY_DSN
ARG GIT_COMMIT

# Set environment variables
ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV REACT_APP_BUILD_TIME=$REACT_APP_BUILD_TIME
ENV REACT_APP_SENTRY_DSN=$REACT_APP_SENTRY_DSN
ENV GIT_COMMIT=$GIT_COMMIT
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache \
    curl \
    tzdata && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set timezone
ENV TZ=UTC

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy service worker and manifest
COPY --from=builder /app/public/sw.js /usr/share/nginx/html/sw.js
COPY --from=builder /app/public/manifest.json /usr/share/nginx/html/manifest.json

# Set proper permissions
RUN chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Create nginx directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    chown -R nextjs:nodejs /var/cache/nginx

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
