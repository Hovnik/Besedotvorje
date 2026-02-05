# Production Deployment Checklist

Use this checklist to ensure your deployment is ready for production.

## ✅ Pre-Deployment

### Environment Setup

- [ ] MongoDB database is provisioned (MongoDB Atlas or self-hosted)
- [ ] OpenAI API key is obtained and tested
- [ ] Backend `.env` file is configured with production values
- [ ] `NODE_ENV` is set to `production`
- [ ] Port is configured correctly (default: 3000)

### Security

- [ ] All sensitive keys are in environment variables (not in code)
- [ ] `.env` files are in `.gitignore` and not committed
- [ ] MongoDB connection uses authentication
- [ ] CORS is configured for your production domain
- [ ] Rate limiting is enabled and configured
- [ ] Helmet security headers are active

### Database

- [ ] MongoDB is accessible from your deployment server
- [ ] Database connection string is tested
- [ ] Database has appropriate indexes
- [ ] IP whitelist is configured (for MongoDB Atlas)

### Code Quality

- [ ] All dependencies are installed
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Frontend builds successfully without errors
- [ ] All API routes are tested

## 🔨 Build Process

### Frontend

- [ ] Run `npm install` in frontend directory
- [ ] Run `npm run build` successfully
- [ ] Verify `dist` folder is created
- [ ] Test built files locally with production server

### Backend

- [ ] Run `npm install` in backend directory
- [ ] Verify all dependencies are installed
- [ ] Test server starts with `NODE_ENV=production`

## 🚀 Deployment

### Single Server Deployment

- [ ] Frontend is built and in `frontend/dist`
- [ ] Backend is configured to serve static files
- [ ] Server is running on correct port
- [ ] Health check endpoint (`/api/health`) returns OK

### Separate Deployments

- [ ] Frontend deployed to hosting (Vercel/Netlify/etc)
- [ ] Backend deployed to hosting (Heroku/Railway/Render/etc)
- [ ] Frontend environment variable `VITE_API_URL` points to backend
- [ ] Backend CORS allows frontend domain

### Platform Specific

#### Heroku

- [ ] Procfile is present
- [ ] Environment variables are set in dashboard
- [ ] MongoDB add-on is configured OR Atlas URI is set
- [ ] Buildpacks are correct (Node.js)

#### Vercel

- [ ] `vercel.json` is configured
- [ ] Environment variables are set
- [ ] Build commands are correct
- [ ] Serverless functions are working

#### Docker

- [ ] Dockerfile builds successfully
- [ ] docker-compose.yml is configured
- [ ] Environment variables are passed correctly
- [ ] Volumes are mounted for MongoDB

## 🧪 Post-Deployment Testing

### Functionality

- [ ] Homepage loads correctly
- [ ] Can submit a word for analysis
- [ ] ChatGPT API integration works
- [ ] Results are displayed correctly
- [ ] Results are cached in MongoDB
- [ ] Second request for same word uses cache
- [ ] History/stats features work
- [ ] Sign in functionality works (if implemented)

### Performance

- [ ] Page loads in < 3 seconds
- [ ] API responses are fast (< 2 seconds for cached)
- [ ] No memory leaks observed
- [ ] Server doesn't crash under load

### Security

- [ ] HTTPS is enabled (SSL certificate)
- [ ] API keys are not exposed in frontend
- [ ] Rate limiting prevents abuse
- [ ] CORS allows only your domains
- [ ] No sensitive data in browser console

### Monitoring

- [ ] Server logs are accessible
- [ ] Error tracking is set up (optional: Sentry, LogRocket)
- [ ] Uptime monitoring is configured (optional)
- [ ] OpenAI API usage is monitored

## 📊 Monitoring & Maintenance

### Health Checks

- [ ] `/api/health` endpoint responds
- [ ] MongoDB connection is healthy
- [ ] OpenAI API key is valid

### Analytics (Optional)

- [ ] Google Analytics or similar is set up
- [ ] User behavior is tracked
- [ ] API usage is logged

### Backup

- [ ] MongoDB backup strategy is in place
- [ ] Code is backed up in Git
- [ ] Environment variables are documented

## 🆘 Rollback Plan

- [ ] Previous version is tagged in Git
- [ ] Know how to revert to previous deployment
- [ ] Database migrations are reversible
- [ ] Contact info for MongoDB/hosting support

## 📈 Optimization (Post-Launch)

- [ ] Set up CDN for static assets
- [ ] Enable gzip compression
- [ ] Optimize images and assets
- [ ] Implement caching headers
- [ ] Add service worker for offline support
- [ ] Consider Redis for session management

## 🎉 Launch

- [ ] All checklist items above are complete
- [ ] Notify team/users of launch
- [ ] Monitor logs for first 24 hours
- [ ] Be ready to respond to issues quickly

---

**Last Updated:** {{ date }}
**Deployment Platform:** ********\_********
**Production URL:** ********\_********
**Deployed By:** ********\_********
