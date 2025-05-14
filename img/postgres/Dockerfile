FROM debian:bookworm-slim

# Set noninteractive installation
ENV DEBIAN_FRONTEND=noninteractive

# Add PostgreSQL repository
RUN apt-get update && apt-get install -y curl ca-certificates gnupg2 lsb-release && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list

# Install PostgreSQL and required dependencies
RUN apt-get update && apt-get install -y \
    postgresql-14 \
    postgresql-contrib-14 \
    postgresql-client-14 \
    libpq-dev \
    locales \
    make \
    gcc \
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

# Set environment variables (non-sensitive)
ENV PGDATA=/var/lib/postgresql/data

# Make sure the PostgreSQL bin directory is in the PATH
ENV PATH="/usr/lib/postgresql/14/bin:${PATH}"

# Create directory for data
RUN mkdir -p "$PGDATA" && chown -R postgres:postgres "$PGDATA" && chmod 700 "$PGDATA"

# Create directory for config files
RUN mkdir -p /etc/postgresql/conf.d && chown -R postgres:postgres /etc/postgresql/conf.d

# Create directory for scripts
RUN mkdir -p /docker-entrypoint-initdb.d && chown -R postgres:postgres /docker-entrypoint-initdb.d

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Switch to postgres user
USER postgres

# Expose PostgreSQL port
EXPOSE 5432

# Set entry point
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start PostgreSQL server
CMD ["postgres"]
