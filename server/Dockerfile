# syntax=docker/dockerfile:1.7
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .


CMD ["npm", "run", "start:dev" ]