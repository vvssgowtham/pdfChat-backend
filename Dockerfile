FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
COPY . .

RUN npm ci && npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
