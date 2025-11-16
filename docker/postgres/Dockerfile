FROM postgres:15

# Copy the repository init SQL into the official Postgres image init folder so
# that the database will be initialized automatically when the container
# starts. This makes CI reproducible because no host bind-mount is required.
COPY database/init.sql /docker-entrypoint-initdb.d/init.sql

# Ensure readable permissions
RUN chmod 644 /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432
