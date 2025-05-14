#!/bin/bash
set -e

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Print environment for debugging (excluding passwords)
log "Starting RabbitMQ container with the following configuration:"
log "- RABBITMQ_USER: ${RABBITMQ_USER:-guest}"
log "- RABBITMQ_VHOST: ${RABBITMQ_VHOST:-/}"

# Create config directory if it doesn't exist
mkdir -p /etc/rabbitmq

# Create RabbitMQ configuration
cat > /etc/rabbitmq/rabbitmq.conf << EOF
# RabbitMQ configuration
listeners.tcp.default = 5672
management.tcp.port = 15672
management.tcp.ip = 0.0.0.0

# Default user settings
default_vhost = ${RABBITMQ_VHOST:-/}
default_user = ${RABBITMQ_USER:-guest}
default_pass = ${RABBITMQ_PASSWORD:-guest}
default_permissions.configure = .*
default_permissions.read = .*
default_permissions.write = .*

# Security and resource settings
loopback_users = none
EOF

# Make sure permissions are correct
chown -R rabbitmq:rabbitmq /etc/rabbitmq /var/lib/rabbitmq

# Start RabbitMQ server
log "Starting RabbitMQ server..."
exec rabbitmq-server
