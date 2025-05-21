# ---------- Base Image ----------
FROM node:22.15.1-alpine3.20 AS base

WORKDIR /app

# Install optional system dependencies
RUN apk add --no-cache libc6-compat && corepack enable

# ---------- Dependencies ----------
FROM base AS deps

WORKDIR /app

# Copy lock files to install dependencies correctly
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies using the correct package manager
RUN \
  if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
  else echo "No lockfile found." && exit 1; \
  fi

# ---------- Build ----------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f package-lock.json ]; then npm run build; \
  elif [ -f yarn.lock ]; then yarn build; \
  elif [ -f pnpm-lock.yaml ]; then pnpm build; \
  else echo "No lockfile found." && exit 1; \
  fi

# ---------- Production ----------
FROM base AS runner

WORKDIR /app

# Create app user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built app and deps
COPY --from=builder --chown=nestjs:nodejs /app .

USER nestjs

EXPOSE 8000

CMD ["npm", "run", "start:prod"]
