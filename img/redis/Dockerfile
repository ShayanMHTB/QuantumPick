FROM debian:bookworm-slim

# Set noninteractive installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Redis and required dependencies
RUN apt-get update && apt-get install -y \
    redis-server \
    curl \
    wget \
    vim \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set locale to UTF-8
RUN apt-get update && apt-get install -y locales && \
    sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Create directory for data
RUN mkdir -p /data && chown -R redis:redis /data

# Create directory for config
RUN mkdir -p /etc/redis/conf.d && chown -R redis:redis /etc/redis/conf.d

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose Redis port
EXPOSE 6379

# Set entry point
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start Redis server
CMD ["redis-server"]
