#!/bin/bash
set -e

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Check for required environment variables
if [ -z "$POSTGRES_USER" ]; then
    log "ERROR: POSTGRES_USER is not set"
    exit 1
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
    log "ERROR: POSTGRES_PASSWORD is not set"
    exit 1
fi

if [ -z "$POSTGRES_DB" ]; then
    log "ERROR: POSTGRES_DB is not set"
    exit 1
fi

# Print environment for debugging (excluding passwords)
log "Starting PostgreSQL container with the following configuration:"
log "- POSTGRES_DB: $POSTGRES_DB"
log "- POSTGRES_USER: $POSTGRES_USER"
log "- POSTGRES_MAX_CONNECTIONS: ${POSTGRES_MAX_CONNECTIONS:-100}"
log "- POSTGRES_SHARED_BUFFERS: ${POSTGRES_SHARED_BUFFERS:-128MB}"

# Initialize PostgreSQL data directory if it's empty
if [ -z "$(ls -A "$PGDATA")" ]; then
    log "Initializing PostgreSQL database..."
    
    # Initialize database
    log "Running initdb..."
    initdb --username="$POSTGRES_USER" --pwfile=<(echo "$POSTGRES_PASSWORD") \
        --auth=md5 --encoding=UTF8 --locale=en_US.UTF-8
    
    # Configure PostgreSQL
    {
        echo "# Connection settings"
        echo "listen_addresses = '*'"
        echo "max_connections = ${POSTGRES_MAX_CONNECTIONS:-100}"
        
        echo "# Memory settings"
        echo "shared_buffers = ${POSTGRES_SHARED_BUFFERS:-128MB}"
        
        echo "# Logging"
        echo "log_destination = 'stderr'"
        echo "logging_collector = on"
        echo "log_directory = 'pg_log'"
        echo "log_truncate_on_rotation = on"
        
    } >> "$PGDATA/postgresql.conf"
    
    # Configure client authentication
    {
        echo "# TYPE  DATABASE        USER            ADDRESS                 METHOD"
        echo "local   all             all                                     trust"
        echo "host    all             all             0.0.0.0/0               md5"
        echo "host    all             all             ::/0                    md5"
    } > "$PGDATA/pg_hba.conf"
    
    # Start PostgreSQL server temporarily to set up the database
    log "Starting PostgreSQL temporarily to set up database..."
    pg_ctl -D "$PGDATA" -o "-c listen_addresses=''" -w start
    
    # Create database if it doesn't exist
    if [ "$POSTGRES_DB" != "postgres" ]; then
        log "Creating database: $POSTGRES_DB"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
            CREATE DATABASE $POSTGRES_DB;
            GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL
    fi
    
    # Create extensions
    log "Creating extensions..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL
    
    # Stop PostgreSQL server
    log "Stopping temporary PostgreSQL instance..."
    pg_ctl -D "$PGDATA" -m fast -w stop
    
    log "PostgreSQL initialization complete!"
else
    log "PostgreSQL data directory already initialized."
fi

# Start PostgreSQL server
log "Starting PostgreSQL server..."
exec postgres
