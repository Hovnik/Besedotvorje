# NPM Scripts Reference

Quick reference for all available npm scripts in the project.

## 🎯 Root Level Scripts

Run these from the project root directory:

### Development

```bash
npm run install:all    # Install all dependencies (backend + frontend)
npm run dev            # Run both backend and frontend in dev mode
npm run dev:backend    # Run only backend in dev mode
npm run dev:frontend   # Run only frontend in dev mode
```

### Production

```bash
npm run build          # Build frontend for production
npm start              # Start production server
npm run deploy         # Build and start production server
```

### Deployment

```bash
npm run heroku-postbuild  # Heroku automatic build hook
```

---

## 💻 Backend Scripts

Run these from `backend/` directory:

```bash
cd backend

npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run create-user    # Create a new user (interactive script)
npm run build          # Build frontend (from backend directory)
npm run deploy         # Build frontend and start production server
```

---

## 🎨 Frontend Scripts

Run these from `frontend/` directory:

```bash
cd frontend

npm run dev            # Start Vite dev server (http://localhost:3000)
npm run build          # Build for production (outputs to dist/)
npm run preview        # Preview production build locally
```

---

## 🚀 Quick Usage Examples

### First Time Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd Besedotvorje

# Install everything
npm run install:all

# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Start development
npm run dev
```

### Development Workflow

```bash
# Start both servers
npm run dev

# Or run separately:
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

### Production Deployment

```bash
# Test production locally
npm run deploy

# Or step by step:
npm run build          # Build frontend
npm start              # Start production server
```

### Docker Deployment

```bash
# Start with Docker
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

---

## 🔧 Utility Scripts

### Create Admin User

```bash
cd backend
npm run create-user
# Follow the prompts
```

### Test Health Endpoint

```bash
# Development
curl http://localhost:5001/api/health

# Production
curl http://localhost:3000/api/health
```

### Clean Install

```bash
# Remove all node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

### Build from Scratch

```bash
# Clean, install, and build
rm -rf frontend/dist
npm run install:all
npm run build
```

---

## 🐳 Docker Commands

```bash
# Build and start
docker-compose up -d

# Rebuild after code changes
docker-compose up -d --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f mongodb

# Execute command in container
docker-compose exec app npm run create-user

# Remove volumes (WARNING: deletes database)
docker-compose down -v
```

---

## 🌐 Port Reference

| Service                   | Dev Port | Prod Port | URL                       |
| ------------------------- | -------- | --------- | ------------------------- |
| Frontend Dev Server       | 3000     | -         | http://localhost:3000     |
| Backend API (Dev)         | 5001     | -         | http://localhost:5001     |
| Backend + Frontend (Prod) | -        | 3000      | http://localhost:3000     |
| MongoDB                   | 27017    | 27017     | mongodb://localhost:27017 |

---

## 📚 More Information

- **Development Setup:** [README.md](README.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Quick Start:** [QUICKSTART.md](QUICKSTART.md)
- **Deployment Checklist:** [CHECKLIST.md](CHECKLIST.md)

---

## 🆘 Troubleshooting

### Script not found

Make sure you're in the correct directory:

- Root level: `/Besedotvorje/`
- Backend: `/Besedotvorje/backend/`
- Frontend: `/Besedotvorje/frontend/`

### Port already in use

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### Dependencies not installing

```bash
# Clear npm cache
npm cache clean --force

# Remove lock files
rm -f package-lock.json backend/package-lock.json frontend/package-lock.json

# Reinstall
npm run install:all
```
