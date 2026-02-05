# Deployment Guide - Besedotvorje

This guide covers deploying the Besedotvorje application to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] MongoDB database is set up (local or MongoDB Atlas)
- [ ] OpenAI API key is obtained
- [ ] Environment variables are configured
- [ ] Dependencies are installed
- [ ] Frontend builds successfully

## 🌐 Environment Variables

### Backend (.env)

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env)

For production builds where frontend and backend are served together, the frontend doesn't need a separate .env file since it proxies through the same server.

## 🚀 Deployment Options

### Option 1: Single Server Deployment (Recommended for Simple Setup)

This method serves both frontend and backend from the same Node.js server.

#### Steps:

1. **Build the frontend:**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Install backend dependencies:**

   ```bash
   cd ../backend
   npm install
   ```

3. **Set environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start the server:**
   ```bash
   NODE_ENV=production npm start
   ```

The server will serve the frontend static files and handle API requests on the same port (default: 3000).

---

### Option 2: Separate Deployment (Frontend + Backend)

Deploy frontend and backend separately for better scalability.

#### Frontend (Vercel, Netlify, etc.)

1. **Build the frontend:**

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

3. **Configure environment:**
   - Set `VITE_API_URL` to your backend URL

#### Backend (Heroku, Railway, Render, etc.)

1. **Push backend code** to your hosting platform
2. **Set environment variables** in the hosting dashboard
3. **Ensure `NODE_ENV=production`**

---

### Option 3: Docker Deployment

#### Using Docker Compose:

1. **Create `docker-compose.yml` in project root:**

   ```yaml
   version: "3.8"
   services:
     backend:
       build: ./backend
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=${MONGODB_URI}
         - OPENAI_API_KEY=${OPENAI_API_KEY}
       depends_on:
         - mongodb

     mongodb:
       image: mongo:7
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db

   volumes:
     mongo-data:
   ```

2. **Create `backend/Dockerfile`:**

   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Install backend dependencies
   COPY backend/package*.json ./
   RUN npm install --production

   # Build frontend
   WORKDIR /frontend
   COPY frontend/package*.json ./
   RUN npm install
   COPY frontend/ ./
   RUN npm run build

   # Copy backend code
   WORKDIR /app
   COPY backend/ ./

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

3. **Run:**
   ```bash
   docker-compose up -d
   ```

---

## 🔧 Platform-Specific Instructions

### Heroku

1. **Create a Heroku app:**

   ```bash
   heroku create your-app-name
   ```

2. **Add MongoDB (MongoDB Atlas recommended):**

   ```bash
   # Set MongoDB URI
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   heroku config:set OPENAI_API_KEY=your_api_key
   heroku config:set NODE_ENV=production
   ```

3. **Create `Procfile` in backend directory:**

   ```
   web: npm run deploy
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Render

1. **Create a new Web Service** on render.com
2. **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
3. **Start Command:** `cd backend && NODE_ENV=production npm start`
4. **Add Environment Variables** in Render dashboard

### Railway

1. **Create a new project** on railway.app
2. **Connect your GitHub repo**
3. **Set environment variables**
4. **Railway will auto-detect and deploy**

### DigitalOcean App Platform

1. **Create a new app**
2. **Select your repository**
3. **Configure build:**
   - Build Command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - Run Command: `cd backend && NODE_ENV=production npm start`
4. **Add environment variables**

---

## 🔒 Security Checklist

- [ ] `NODE_ENV` is set to `production`
- [ ] All sensitive keys are in environment variables (not committed)
- [ ] MongoDB connection uses authentication
- [ ] CORS is configured to allow only your frontend domain
- [ ] Rate limiting is enabled
- [ ] Helmet security headers are active
- [ ] MongoDB sanitization is enabled

---

## 🧪 Testing Production Build Locally

```bash
# Build frontend
cd frontend
npm run build

# Set environment to production
cd ../backend
export NODE_ENV=production

# Start server
npm start
```

Visit `http://localhost:3000` to test the production build.

---

## 📊 Monitoring

- Monitor MongoDB connection status
- Track OpenAI API usage and costs
- Set up error logging (e.g., Sentry)
- Monitor server health at `/api/health`

---

## 🆘 Troubleshooting

### Frontend shows blank page

- Check browser console for errors
- Verify `dist` folder exists in `frontend/`
- Check that backend is serving static files correctly

### API requests fail

- Verify backend URL is correct
- Check CORS configuration
- Ensure MongoDB is connected

### MongoDB connection fails

- Verify `MONGODB_URI` is correct
- Check network access rules (for MongoDB Atlas)
- Ensure IP is whitelisted

### OpenAI API errors

- Verify API key is valid
- Check API quota and billing
- Review rate limits

---

## 📞 Support

For issues, check:

- Server logs for error messages
- MongoDB connection status
- OpenAI API dashboard
- Network and firewall settings
