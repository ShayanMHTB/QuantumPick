FROM debian:bookworm-slim

# Set noninteractive installation
ENV DEBIAN_FRONTEND=noninteractive

# Install RabbitMQ directly from Debian repositories
RUN apt-get update && apt-get install -y \
    rabbitmq-server \
    locales \
    curl \
    wget \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set locale to UTF-8
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Enable RabbitMQ Management Plugin
RUN rabbitmq-plugins enable rabbitmq_management

# Create directory for data
RUN mkdir -p /var/lib/rabbitmq/mnesia && chown -R rabbitmq:rabbitmq /var/lib/rabbitmq

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose RabbitMQ ports
EXPOSE 5672 15672

# Set entry point
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start RabbitMQ server
CMD ["rabbitmq-server"]
