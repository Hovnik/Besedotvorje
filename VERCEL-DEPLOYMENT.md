# Vercel Deployment Guide

## 🚀 Recommended Approach: Frontend Only on Vercel

Since Vercel is optimized for frontend deployments, the best approach is:

- **Frontend** → Deploy to Vercel
- **Backend** → Deploy to Railway, Render, or Heroku

### Vercel Configuration (Frontend Only)

**Build Command:**

```
npm run vercel-build
```

**Output Directory:**

```
frontend/dist
```

**Install Command:**

```
npm install
```

### Environment Variables in Vercel

Add these in your Vercel project settings → Environment Variables:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

Replace `your-backend-url.railway.app` with your actual backend URL.

### Steps:

1. **Deploy Backend First** (Railway/Render/Heroku)
   - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for backend deployment
   - Note the backend URL (e.g., `https://your-app.railway.app`)

2. **Deploy Frontend to Vercel**
   - Connect your GitHub repo to Vercel
   - Set Root Directory: Keep as `.` (root)
   - Framework Preset: `Vite`
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`
   - Add environment variable: `VITE_API_URL` = your backend URL

3. **Update Backend CORS**
   - In your backend `.env`, set:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ```

---

## ⚠️ Alternative: Full Stack on Vercel (Advanced)

If you want to deploy both frontend and backend to Vercel using serverless functions, you'll need to restructure your backend. This is more complex.

### Why It's Challenging:

- Vercel serverless functions have a 10-second timeout
- ChatGPT API calls can take longer
- MongoDB connections need to be managed carefully in serverless

### If You Still Want to Try:

1. **Move backend to `api/` directory** as serverless functions
2. **Update vercel.json** (already configured)
3. **Vercel Settings:**
   - Build Command: `npm run vercel-build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

4. **Environment Variables in Vercel:**

   ```env
   MONGODB_URI=your_mongodb_atlas_uri
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=production
   ```

5. **Limitations:**
   - 10-second function timeout (may fail for slow ChatGPT responses)
   - Cold starts (first request may be slow)
   - Need MongoDB Atlas (no local MongoDB)

---

## ✅ Recommended Setup Summary

### For Vercel Dashboard:

| Setting              | Value                  |
| -------------------- | ---------------------- |
| **Build Command**    | `npm run vercel-build` |
| **Output Directory** | `frontend/dist`        |
| **Install Command**  | `npm install`          |
| **Root Directory**   | `.` (root)             |
| **Framework Preset** | Vite                   |

### Environment Variables:

| Variable         | Value                              | Where             |
| ---------------- | ---------------------------------- | ----------------- |
| `VITE_API_URL`   | `https://your-backend.railway.app` | Vercel (Frontend) |
| `FRONTEND_URL`   | `https://your-app.vercel.app`      | Backend hosting   |
| `MONGODB_URI`    | Your MongoDB connection string     | Backend hosting   |
| `OPENAI_API_KEY` | Your OpenAI API key                | Backend hosting   |

---

## 🔄 Quick Deploy Steps

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push
   ```

2. **Deploy Backend to Railway** (recommended)
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub
   - Select your repo
   - Add environment variables (MONGODB_URI, OPENAI_API_KEY, etc.)
   - Note the deployed URL

3. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - New Project → Import from GitHub
   - Select your repo
   - Configure settings (see table above)
   - Add `VITE_API_URL` environment variable
   - Deploy!

4. **Update Backend CORS**
   - In Railway, update `FRONTEND_URL` to your Vercel URL
   - Redeploy backend

---

## 🧪 Testing

After deployment:

1. **Test frontend:** Visit your Vercel URL
2. **Check API connection:** Try analyzing a word
3. **Verify health:** Visit `https://your-backend.railway.app/api/health`

---

## 🆘 Troubleshooting

### CORS Errors

- Make sure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Include `https://` in the URL
- Redeploy backend after changing environment variables

### API Not Working

- Verify `VITE_API_URL` in Vercel matches your backend URL
- Make sure backend is running (check backend health endpoint)
- Check backend logs for errors

### Build Fails

- Check Vercel build logs
- Verify all frontend dependencies are in `frontend/package.json`
- Make sure `vercel-build` script exists in root `package.json`

---

## 💡 Pro Tips

- Use Railway's free tier for backend (500 hours/month)
- Use MongoDB Atlas free tier for database
- Keep an eye on OpenAI API costs
- Set up Vercel GitHub integration for automatic deployments
- Use Vercel preview deployments for testing

---

## 📚 More Help

- [General Deployment Guide](DEPLOYMENT.md)
- [Deployment Checklist](CHECKLIST.md)
- [Quick Start](QUICKSTART.md)
