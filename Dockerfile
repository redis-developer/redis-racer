FROM node:latest AS base
WORKDIR /app

FROM base AS deps
COPY package-lock.json ./package-lock.json
COPY package.json ./package.json
RUN npm install

FROM base AS prod-deps
COPY package-lock.json ./package-lock.json
COPY package.json ./package.json
RUN npm install --omit=dev

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM base AS runner
ENV NODE_ENV production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .

ENV PORT 3000

EXPOSE ${PORT}

# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "."]
