FROM node:24-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy all lib packages (API server depends on these)
COPY lib/ lib/

# Copy only the API server artifact
COPY artifacts/api-server/ artifacts/api-server/

# Install dependencies - no frozen lockfile so version differences don't break it
RUN pnpm install --no-frozen-lockfile

# Build the API server
RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
