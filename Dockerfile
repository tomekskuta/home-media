FROM node:22.14.0-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

# Create entrypoint script to handle secrets
COPY . .

RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'mkdir -p "$(dirname "$GOOGLE_APPLICATION_CREDENTIALS")"' >> /app/docker-entrypoint.sh && \
    echo 'if [ -f "/run/secrets/gcp_credentials" ]; then' >> /app/docker-entrypoint.sh && \
    echo '    ln -sf /run/secrets/gcp_credentials "$GOOGLE_APPLICATION_CREDENTIALS"' >> /app/docker-entrypoint.sh && \
    echo 'fi' >> /app/docker-entrypoint.sh && \
    echo 'exec "$@"' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh && \
    dos2unix /app/docker-entrypoint.sh

# Install dos2unix to handle potential line ending issues
RUN apk add --no-cache dos2unix

# # Copy the entire application first
# COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build CSS and compile TypeScript
RUN pnpm build

# Expose port 3001
EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["pnpm", "start"]
