# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app

COPY core/package.json core/yarn.lock* core/package-lock.json* core/pnpm-lock.yaml* core/.npmrc* ./core/
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/core/node_modules ./core/node_modules
COPY --exclude=/ui ./ ./
RUN npm i typescript -g
RUN npx prisma generate
RUN tsc


FROM base AS runner
WORKDIR /app
COPY --from=builder /app/build ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/core/node_modules ./core/node_modules

EXPOSE 3001

CMD ["node","--import=extensionless/register", "./core/src/index.js"]