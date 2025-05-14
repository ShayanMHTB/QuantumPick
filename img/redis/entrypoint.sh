#!/bin/bash
set -e

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Print environment for debugging
log "Starting Redis container with the following configuration:"
log "- REDIS_MAXMEMORY: ${REDIS_MAXMEMORY:-256mb}"
log "- REDIS_PASSWORD: ${REDIS_PASSWORD:-(None)}"

# Create Redis configuration
CONFIG_FILE="/etc/redis/redis.conf"

{
    echo "# Redis configuration"
    echo "bind 0.0.0.0"
    echo "protected-mode no"  # Disable protected mode to allow external connections
    echo "port 6379"
    echo "tcp-backlog 511"
    echo "timeout 0"
    echo "tcp-keepalive 300"
    echo "daemonize no"
    echo "supervised no"
    echo "pidfile /var/run/redis/redis-server.pid"
    echo "loglevel notice"
    echo "logfile \"\""
    echo "databases 16"
    echo "always-show-logo yes"
    echo "save 900 1"
    echo "save 300 10"
    echo "save 60 10000"
    echo "stop-writes-on-bgsave-error yes"
    echo "rdbcompression yes"
    echo "rdbchecksum yes"
    echo "dbfilename dump.rdb"
    echo "dir /data"
    echo "replica-serve-stale-data yes"
    echo "replica-read-only yes"
    echo "repl-diskless-sync no"
    echo "repl-diskless-sync-delay 5"
    echo "repl-disable-tcp-nodelay no"
    echo "replica-priority 100"
    echo "maxmemory ${REDIS_MAXMEMORY:-256mb}"
    echo "maxmemory-policy volatile-lru"
    echo "lazyfree-lazy-eviction no"
    echo "lazyfree-lazy-expire no"
    echo "lazyfree-lazy-server-del no"
    echo "replica-lazy-flush no"
    echo "appendonly no"
    echo "appendfilename \"appendonly.aof\""
    echo "appendfsync everysec"
    echo "no-appendfsync-on-rewrite no"
    echo "auto-aof-rewrite-percentage 100"
    echo "auto-aof-rewrite-min-size 64mb"
    echo "aof-load-truncated yes"
    echo "aof-use-rdb-preamble yes"
    echo "lua-time-limit 5000"
    echo "slowlog-log-slower-than 10000"
    echo "slowlog-max-len 128"
    echo "latency-monitor-threshold 0"
    echo "notify-keyspace-events \"\""
    echo "hash-max-ziplist-entries 512"
    echo "hash-max-ziplist-value 64"
    echo "list-max-ziplist-size -2"
    echo "list-compress-depth 0"
    echo "set-max-intset-entries 512"
    echo "zset-max-ziplist-entries 128"
    echo "zset-max-ziplist-value 64"
    echo "hll-sparse-max-bytes 3000"
    echo "stream-node-max-bytes 4096"
    echo "stream-node-max-entries 100"
    echo "activerehashing yes"
    echo "client-output-buffer-limit normal 0 0 0"
    echo "client-output-buffer-limit replica 256mb 64mb 60"
    echo "client-output-buffer-limit pubsub 32mb 8mb 60"
    echo "hz 10"
    echo "dynamic-hz yes"
    echo "aof-rewrite-incremental-fsync yes"
    echo "rdb-save-incremental-fsync yes"
    
    # Add password if provided
    if [ ! -z "$REDIS_PASSWORD" ] && [ "$REDIS_PASSWORD" != "null" ]; then
        log "Setting Redis password"
        echo "requirepass $REDIS_PASSWORD"
    fi
} > "$CONFIG_FILE"

# Start Redis server
log "Starting Redis server..."
exec redis-server "$CONFIG_FILE"
