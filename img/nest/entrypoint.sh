#!/bin/bash
set -e

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Wait for database to be ready
log "Waiting for PostgreSQL to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if nc -z postgresql 5432 2>/dev/null; then
        log "PostgreSQL is ready!"
        break
    fi
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log "ERROR: PostgreSQL failed to start within 30 seconds"
    exit 1
fi

# Wait for Redis to be ready
log "Waiting for Redis to be ready..."
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if nc -z redis 6379 2>/dev/null; then
        log "Redis is ready!"
        break
    fi
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log "ERROR: Redis failed to start within 30 seconds"
    exit 1
fi

# Wait for RabbitMQ to be ready
log "Waiting for RabbitMQ to be ready..."
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if nc -z rabbitmq 5672 2>/dev/null; then
        log "RabbitMQ is ready!"
        break
    fi
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log "WARNING: RabbitMQ not responding, continuing anyway..."
fi

# Check if package.json exists
if [ -f "/app/package.json" ]; then
    log "Found package.json, checking dependencies..."
    
    # Check if node_modules exists
    if [ ! -d "/app/node_modules" ] || [ ! -d "/app/node_modules/@nestjs" ]; then
        log "Installing dependencies..."
        cd /app && npm install --legacy-peer-deps
    else
        log "Dependencies already installed."
    fi
else
    log "ERROR: No package.json found in /app directory!"
    exit 1
fi

# Generate Prisma client
if [ -f "/app/prisma/schema.prisma" ]; then
    log "Generating Prisma client..."
    cd /app && npx prisma generate
    
    # Run Prisma migrations
    log "Running Prisma migrations..."
    cd /app && npx prisma migrate deploy
    
    # Start Prisma Studio in the background
    log "Starting Prisma Studio..."
    cd /app && npx prisma studio --port 5555 &
    PRISMA_STUDIO_PID=$!
    log "Prisma Studio started on port 5555"
else
    log "WARNING: No Prisma schema found."
fi

log "Starting NestJS application..."
# Start the application with Node.js flags
cd /app && NODE_OPTIONS="--no-deprecation" npm run start:dev

# This line should never be reached if the application starts correctly
log "ERROR: Application exited unexpectedly"
exit 1
