FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src ./src
RUN mkdir -p /app/data

CMD ["npx", "tsx", "src/index.ts"]