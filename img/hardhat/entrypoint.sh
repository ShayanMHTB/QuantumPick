#!/bin/bash
set -e

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Check if package.json exists
if [ -f "/app/package.json" ]; then
    log "Found package.json, checking dependencies..."
    
    # Check if node_modules exists
    if [ ! -d "/app/node_modules" ] || [ ! -d "/app/node_modules/hardhat" ]; then
        log "Installing dependencies..."
        cd /app && npm install
    else
        log "Dependencies already installed."
    fi
else
    log "ERROR: No package.json found in /app directory!"
    exit 1
fi

log "Checking Hardhat node state..."

# Check if we need to compile contracts first
if [ ! -d "/app/artifacts" ] || [ "$(ls -A /app/artifacts 2>/dev/null)" == "" ]; then
    log "Compiling contracts..."
    cd /app && ./node_modules/.bin/hardhat compile
fi

# Check for state database and create if necessary
STATE_DIR="/app/hardhat-state"
if [ ! -d "$STATE_DIR" ]; then
    log "Creating state directory..."
    mkdir -p "$STATE_DIR"
fi

log "Starting Hardhat node..."

# Start Hardhat node in the background using the local installation
cd /app && ./node_modules/.bin/hardhat node --hostname 0.0.0.0 --port 8545 &
HARDHAT_PID=$!

# Wait for Hardhat node to be ready
log "Waiting for Hardhat node to be ready..."
MAX_ATTEMPTS=30
ATTEMPT=0
while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if nc -z localhost 8545 2>/dev/null; then
        log "Hardhat node is ready!"
        break
    fi
    sleep 1
    ATTEMPT=$((ATTEMPT + 1))
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    log "ERROR: Hardhat node failed to start within 30 seconds"
    exit 1
fi

# Check if environment setup is needed
if [ ! -d "/app/generated" ] || [ ! -f "/app/generated/environment.json" ]; then
    log "Setting up development environment..."
    cd /app && ./node_modules/.bin/hardhat run scripts/setup-full-environment.ts --network localhost
    log "Development environment setup complete!"
else
    log "Environment already set up."
fi

# Keep the Hardhat node running
log "Hardhat node running on port 8545..."
wait $HARDHAT_PID
