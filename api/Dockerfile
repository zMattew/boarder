# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
RUN npm i turbo@2.5.5 -g
COPY . .
RUN turbo prune api --docker

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/out/json/ .
RUN npm ci
COPY --from=deps /app/out/full/ .
RUN npm i turbo@2.5.5 -g
RUN turbo run build


FROM base AS runner
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3001
RUN ls

CMD ["npm", "run", "api:start"]
