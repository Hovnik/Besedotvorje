# Quick Start Guide

## 🚀 Development Mode

### First Time Setup

1. **Clone and install:**

   ```bash
   git clone <your-repo-url>
   cd Besedotvorje
   npm run install:all
   ```

2. **Configure environment variables:**

   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB URI and OpenAI API key
   ```

3. **Start development servers:**

   ```bash
   # Option 1: Run both servers concurrently
   npm run dev

   # Option 2: Run separately in different terminals
   npm run dev:backend   # Terminal 1
   npm run dev:frontend  # Terminal 2
   ```

4. **Access the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

---

## 🏭 Production Mode (Local Testing)

1. **Build the frontend:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Start production server:**

   ```bash
   cd ../backend
   NODE_ENV=production npm start
   ```

3. **Access the app:**
   - http://localhost:3000 (serves both frontend and API)

---

## 🐳 Docker (Easiest Production Setup)

1. **Create .env file:**

   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env
   ```

2. **Start with Docker Compose:**

   ```bash
   docker-compose up -d
   ```

3. **Access:**
   - http://localhost:3000

4. **Stop:**
   ```bash
   docker-compose down
   ```

---

## 📦 Using the Build Script

```bash
chmod +x build.sh
./build.sh
```

This will:

- Install all dependencies
- Build frontend for production
- Create .env if it doesn't exist

---

## 🔑 Required Environment Variables

### Backend (.env)

```env
# Required
MONGODB_URI=mongodb://localhost:27017/besedotvorje
OPENAI_API_KEY=sk-your-api-key-here

# Optional
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env) - Only if deploying separately

```env
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guides for:

- Heroku
- Vercel
- Railway
- Render
- DigitalOcean
- Docker

---

## ✅ Pre-Deployment Checklist

See [CHECKLIST.md](CHECKLIST.md) for a complete deployment checklist.

---

## 🧪 Testing

### Test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "OK",
  "message": "Server is running",
  "openai": "configured",
  "mongodb": "connected"
}
```

---

## 🆘 Common Issues

### Port already in use

```bash
# Find process using port 3000
lsof -ti:3000
# Kill it
kill -9 <PID>
```

### MongoDB connection failed

- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env
- For Atlas: Check IP whitelist

### OpenAI API errors

- Verify API key in .env
- Check OpenAI account has credits
- Review rate limits

---

## 📚 More Resources

- [README.md](README.md) - Full project documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guides
- [CHECKLIST.md](CHECKLIST.md) - Deployment checklist
