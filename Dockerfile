FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
WORKDIR /app/backend
RUN npm install --production

WORKDIR /app/frontend
RUN npm install

# Copy source files
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Switch to backend for runtime
WORKDIR /app/backend

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["npm", "start"]
