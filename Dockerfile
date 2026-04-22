# Stage 1: Build
FROM node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Собираем production-версию
RUN npm run build

# Stage 2: Serve
FROM nginx:stable-alpine
# Копируем собранный React/Vite билд в папку Nginx
COPY --from=builder /app/dist /usr/share/nginx/html
# Копируем наш кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
