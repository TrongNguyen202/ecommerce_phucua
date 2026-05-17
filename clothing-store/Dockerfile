# ─────────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files trước để tận dụng Docker cache
COPY package.json package-lock.json ./

RUN npm ci

# Copy toàn bộ source
COPY . .

# Build production
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Serve với Nginx
# ─────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy dist từ stage build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]