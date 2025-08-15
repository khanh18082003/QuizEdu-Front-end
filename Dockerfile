# Stage 1: Build app
FROM node:22-alpine AS build

WORKDIR /app

# Copy package.json và lock file
COPY package.json package-lock.json* yarn.lock* ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build app cho production
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:stable-alpine

# Copy file build từ stage trước sang thư mục Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy cấu hình Nginx nếu muốn custom (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
