FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY tests ./tests
RUN npm run build


FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=build /app/dist ./dist

ENTRYPOINT ["node", "dist/src/start.js"]

