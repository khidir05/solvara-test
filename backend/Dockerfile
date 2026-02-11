FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

RUN apk add --no-cache openssl

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

RUN npx prisma generate

# Expose API port (worker doesn't use it, but harmless)
EXPOSE 4000

# Default command (overridden by docker-compose for api/worker)
CMD ["npm", "run", "dev"]