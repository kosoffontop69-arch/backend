# 🚀 Render Deployment Guide

## Backend Deployment on Render

This guide will help you deploy your AI Learning Platform backend to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **OpenAI API Key**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

## Step 1: Prepare Your Repository

Make sure your backend folder contains:
- ✅ `server.js` (main entry point)
- ✅ `package.json` (with start script)
- ✅ `render.yaml` (deployment configuration)
- ✅ All your source code

## Step 2: Deploy to Render

### Option A: Using Render Dashboard

1. **Connect GitHub**:
   - Go to [render.com](https://render.com)
   - Sign in and connect your GitHub account
   - Select your repository

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend

3. **Configure Service**:
   - **Name**: `ai-learning-platform-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (or paid if you need more resources)

4. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-here
   OPENAI_API_KEY=sk-your-openai-api-key-here
   CORS_ORIGIN=https://your-frontend-domain.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

### Option B: Using render.yaml (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Deploy via Render Dashboard**:
   - Go to Render dashboard
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Render will automatically detect `render.yaml`

## Step 3: Configure Environment Variables

In your Render dashboard, go to your service and add these environment variables:

### Required Variables:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will override this)
- `JWT_SECRET`: Generate a strong secret key
- `OPENAI_API_KEY`: Your OpenAI API key
- `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.netlify.app`)

### Optional Variables:
- `RATE_LIMIT_WINDOW_MS`: `900000` (15 minutes)
- `RATE_LIMIT_MAX_REQUESTS`: `100`

## Step 4: Update Frontend Configuration

Update your frontend `script.js` to point to your Render backend:

```javascript
// Change this line in your frontend/script.js
const API_BASE_URL = 'https://your-backend-name.onrender.com/api';
```

## Step 5: Test Your Deployment

1. **Check Health Endpoint**:
   ```
   https://your-backend-name.onrender.com/api/health
   ```

2. **Test API Endpoints**:
   - Registration: `POST /api/auth/register`
   - Login: `POST /api/auth/login`
   - Ideas: `POST /api/ideas`
   - Interviews: `POST /api/interviews`

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that `package.json` has correct start script
   - Ensure all dependencies are in `dependencies` not `devDependencies`

2. **Service Won't Start**:
   - Check environment variables are set correctly
   - Verify `JWT_SECRET` and `OPENAI_API_KEY` are set

3. **CORS Errors**:
   - Update `CORS_ORIGIN` to your frontend URL
   - Check that frontend is using correct backend URL

4. **Database Issues**:
   - SQLite database will be created automatically
   - Data persists between deployments

### Logs and Monitoring:

- View logs in Render dashboard
- Monitor performance and errors
- Set up alerts for downtime

## Production Considerations

1. **Database**: Consider upgrading to PostgreSQL for production
2. **File Storage**: Use cloud storage for uploaded files
3. **Monitoring**: Set up proper logging and monitoring
4. **Security**: Use strong JWT secrets and API keys
5. **Scaling**: Upgrade to paid plan for better performance

## Your Backend URL

After deployment, your backend will be available at:
```
https://your-backend-name.onrender.com
```

API endpoints:
- Health: `https://your-backend-name.onrender.com/api/health`
- Auth: `https://your-backend-name.onrender.com/api/auth`
- Ideas: `https://your-backend-name.onrender.com/api/ideas`
- Interviews: `https://your-backend-name.onrender.com/api/interviews`

## Next Steps

1. Deploy your backend to Render
2. Update your frontend to use the new backend URL
3. Test all functionality
4. Set up monitoring and alerts
5. Consider upgrading to paid plan for better performance

Your backend is ready for production deployment! 🚀
