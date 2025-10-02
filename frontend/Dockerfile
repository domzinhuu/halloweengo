# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx on port 3000
CMD ["sh", "-c", "sed -i 's/listen 80;/listen 3000;/' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
