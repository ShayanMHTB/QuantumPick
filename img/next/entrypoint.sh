#!/bin/bash
set -e

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Wait for backend to be ready
log "Waiting for NestJS backend to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if nc -z nest 3000 2>/dev/null; then
        log "NestJS backend is ready!"
        break
    fi
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log "WARNING: NestJS backend not responding, continuing anyway..."
fi

# Check if package.json exists
if [ -f "/app/package.json" ]; then
    log "Found package.json, checking dependencies..."
    
    # Check if node_modules exists
    if [ ! -d "/app/node_modules" ] || [ ! -d "/app/node_modules/next" ]; then
        log "Installing dependencies..."
        cd /app && npm install --legacy-peer-deps
    else
        log "Dependencies already installed."
    fi
else
    log "ERROR: No package.json found in /app directory!"
    exit 1
fi

log "Starting Next.js application..."
# Start the application in development mode
cd /app && npm run dev

# This line should never be reached if the application starts correctly
log "ERROR: Application exited unexpectedly"
exit 1
