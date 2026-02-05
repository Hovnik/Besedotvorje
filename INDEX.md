# 📚 Documentation Index

Complete guide to all documentation and configuration files in this project.

## 🎯 Start Here

| Document                                           | Purpose                                | When to Use                                 |
| -------------------------------------------------- | -------------------------------------- | ------------------------------------------- |
| **[README.md](README.md)**                         | Project overview and local development | First-time setup, understanding the project |
| **[QUICKSTART.md](QUICKSTART.md)**                 | Quick start guide                      | Get up and running fast                     |
| **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** | What's been done for deployment        | Overview of deployment readiness            |

## 🚀 Deployment

| Document                           | Purpose                        | When to Use                                             |
| ---------------------------------- | ------------------------------ | ------------------------------------------------------- |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | Comprehensive deployment guide | Deploy to Heroku, Vercel, Railway, Render, Docker, etc. |
| **[CHECKLIST.md](CHECKLIST.md)**   | Pre-deployment checklist       | Before going live, ensure nothing is missed             |
| **[SCRIPTS.md](SCRIPTS.md)**       | All npm scripts reference      | Find the right command to run                           |

## ⚙️ Configuration Files

### Root Level

| File                 | Purpose                               |
| -------------------- | ------------------------------------- |
| `package.json`       | Root package with convenience scripts |
| `.gitignore`         | Global git ignore patterns            |
| `Dockerfile`         | Docker container definition           |
| `docker-compose.yml` | Multi-container Docker setup          |
| `Procfile`           | Heroku deployment config              |
| `vercel.json`        | Vercel serverless config              |
| `.dockerignore`      | Docker build optimization             |
| `build.sh`           | Automated build script                |

### Backend Configuration

| File                   | Purpose                             |
| ---------------------- | ----------------------------------- |
| `backend/package.json` | Backend dependencies and scripts    |
| `backend/.env.example` | Environment variables template      |
| `backend/.gitignore`   | Backend-specific git ignores        |
| `backend/server.js`    | Main server file (production-ready) |

### Frontend Configuration

| File                          | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| `frontend/package.json`       | Frontend dependencies and scripts                |
| `frontend/.env.example`       | Frontend env template (for separate deployments) |
| `frontend/.gitignore`         | Frontend-specific git ignores                    |
| `frontend/vite.config.js`     | Vite build configuration                         |
| `frontend/tailwind.config.js` | Tailwind CSS configuration                       |
| `frontend/postcss.config.js`  | PostCSS configuration                            |

## 📁 Project Structure

```
Besedotvorje/
├── 📄 Documentation (You are here!)
│   ├── README.md              # Project overview
│   ├── QUICKSTART.md          # Quick start guide
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── DEPLOYMENT_SUMMARY.md  # What's been done
│   ├── CHECKLIST.md           # Deployment checklist
│   ├── SCRIPTS.md             # npm scripts reference
│   ├── TODO.md                # Project tasks
│   └── INDEX.md               # This file
│
├── 🐳 Deployment Configs
│   ├── Dockerfile             # Docker container
│   ├── docker-compose.yml     # Docker Compose
│   ├── Procfile               # Heroku
│   ├── vercel.json            # Vercel
│   ├── .dockerignore          # Docker ignore
│   ├── .gitignore             # Git ignore
│   └── build.sh               # Build script
│
├── 📦 Root Package
│   └── package.json           # Convenience scripts
│
├── 🔧 Backend/
│   ├── server.js              # Express server (production-ready)
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   ├── controllers/           # Business logic
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   └── scripts/               # Utility scripts
│
└── 🎨 Frontend/
    ├── vite.config.js         # Vite configuration
    ├── package.json           # Dependencies
    ├── .env.example           # Environment template
    ├── src/
    │   ├── App.jsx            # Main app component
    │   ├── components/        # React components
    │   ├── modals/            # Modal components
    │   └── index.css          # Tailwind styles
    └── public/                # Static assets
```

## 🎓 Learning Path

### For Developers (First Time)

1. Read [README.md](README.md) for project overview
2. Follow [QUICKSTART.md](QUICKSTART.md) to set up locally
3. Use [SCRIPTS.md](SCRIPTS.md) for development commands
4. Refer to code comments for specific functionality

### For Deployment

1. Read [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) for overview
2. Use [CHECKLIST.md](CHECKLIST.md) to prepare
3. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for your platform
4. Test locally first with production mode

### For Maintenance

1. Check [TODO.md](TODO.md) for pending tasks
2. Use [SCRIPTS.md](SCRIPTS.md) for commands
3. Monitor using `/api/health` endpoint
4. Review logs regularly

## 🔑 Key Files to Understand

### Backend Core

- **[server.js](backend/server.js)** - Main server, handles routing, static files, security
- **[wordController.js](backend/controllers/wordController.js)** - ChatGPT integration and caching
- **[userController.js](backend/controllers/userController.js)** - User authentication

### Frontend Core

- **[App.jsx](frontend/src/App.jsx)** - Main app component with routing
- **[WordAnalyzer.jsx](frontend/src/components/WordAnalyzer.jsx)** - Main word analysis interface
- **[StatsModal.jsx](frontend/src/modals/StatsModal.jsx)** - Statistics view
- **[EditResultModal.jsx](frontend/src/modals/EditResultModal.jsx)** - Edit word analysis

## 🛠️ Configuration Reference

### Environment Variables

**Backend (.env)**

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `OPENAI_API_KEY` - OpenAI API key
- `FRONTEND_URL` - Frontend URL for CORS

**Frontend (.env)** - Only for separate deployments

- `VITE_API_URL` - Backend API URL

See `.env.example` files for templates.

### Scripts Quick Reference

```bash
# Development
npm run dev              # Run both backend and frontend
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Production
npm run build            # Build frontend
npm start                # Start production server
npm run deploy           # Build and start

# Utilities
npm run install:all      # Install all dependencies
```

## 📊 Deployment Matrix

| Platform     | Difficulty  | Cost      | Best For         |
| ------------ | ----------- | --------- | ---------------- |
| Railway      | ⭐ Easy     | Free tier | Beginners        |
| Render       | ⭐ Easy     | Free tier | Simple apps      |
| Heroku       | ⭐⭐ Medium | Paid      | Established apps |
| Vercel       | ⭐⭐ Medium | Free tier | Serverless       |
| DigitalOcean | ⭐⭐⭐ Hard | $5+/mo    | Full control     |
| Docker       | ⭐⭐⭐ Hard | Variable  | Containers       |

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guides.

## 🔍 Quick Search

Looking for something specific?

- **How to run locally?** → [QUICKSTART.md](QUICKSTART.md)
- **How to deploy?** → [DEPLOYMENT.md](DEPLOYMENT.md)
- **What commands are available?** → [SCRIPTS.md](SCRIPTS.md)
- **Ready to deploy?** → [CHECKLIST.md](CHECKLIST.md)
- **What's been configured?** → [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)
- **Project overview?** → [README.md](README.md)

## 💡 Tips

- Always test production builds locally first
- Keep `.env` files secure and never commit them
- Monitor `/api/health` endpoint after deployment
- Check MongoDB connection before deploying
- Verify OpenAI API key has credits

## 🆘 Help & Support

1. Check relevant documentation (see above)
2. Review error logs
3. Test `/api/health` endpoint
4. Verify environment variables
5. Check [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting sections

---

**Last Updated:** 2026-02-05  
**Project Version:** 1.0.0  
**Status:** ✅ Production Ready
