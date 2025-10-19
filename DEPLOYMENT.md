# Janhit - Deployment Guide

This guide will help you deploy your Janhit application using modern deployment platforms.

## Architecture
- **Frontend**: React + TypeScript + Vite (deployed on Vercel)
- **Backend**: Node.js + Express (deployed on Railway)
- **Database**: MongoDB Atlas (cloud database)
- **File Storage**: Cloudinary

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **MongoDB Atlas Account** - For cloud database
3. **Cloudinary Account** - For image/file storage
4. **Vercel Account** - For frontend deployment
5. **Railway Account** - For backend deployment

## Step-by-Step Deployment

### 1. Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for production
5. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/janhit`)

### 2. Setup Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret from the dashboard

### 3. Deploy Backend on Railway

1. Go to [Railway](https://railway.app/)
2. Sign up with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect it's a Node.js project
6. Configure environment variables in Railway dashboard:
   ```
   PORT=8000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/janhit
   ACCESS_TOKEN_SECRET=your_super_secure_jwt_secret_key_change_this
   CORS=https://your-frontend-domain.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
7. Set the root directory to `Server`
8. Deploy and note your Railway app URL (e.g., `https://your-app.railway.app`)

### 4. Deploy Frontend on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Sign up with your GitHub account
3. Click "New Project" → Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `Client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app
   ```
6. Deploy and note your Vercel app URL

### 5. Update CORS Settings

1. Go back to your Railway backend deployment
2. Update the `CORS` environment variable with your actual Vercel URL:
   ```
   CORS=https://your-actual-vercel-domain.vercel.app
   ```
3. Redeploy the backend

### 6. Update Frontend API URLs

The `ApiUri.ts` file has been updated to automatically use the correct URLs based on environment. Make sure your `VITE_API_BASE_URL` environment variable in Vercel matches your Railway backend URL.

## Alternative Deployment Options

### Option 2: Netlify + Render

**Frontend on Netlify:**
1. Connect your GitHub repo to Netlify
2. Set build settings:
   - Build command: `cd Client && npm run build`
   - Publish directory: `Client/dist`

**Backend on Render:**
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set:
   - Root Directory: `Server`
   - Build Command: `npm install`
   - Start Command: `npm start`

### Option 3: Full Stack on Render

Deploy both frontend and backend on Render using their static site + web service combo.

## Environment Variables Reference

### Backend Environment Variables
```
PORT=8000
MONGODB_URI=your_mongodb_atlas_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret_minimum_32_characters
CORS=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables
```
VITE_API_BASE_URL=https://your-backend-domain.com
```

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] Backend API endpoints respond correctly
- [ ] User registration/login works
- [ ] Database connections are successful
- [ ] File uploads work (Cloudinary integration)
- [ ] Maps functionality works
- [ ] Admin dashboard is accessible
- [ ] All features tested in production environment

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your backend CORS environment variable includes your frontend domain
2. **Database Connection**: Verify MongoDB Atlas connection string and IP whitelist
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **File Uploads**: Ensure Cloudinary credentials are correct
5. **API Calls Failing**: Verify the frontend is using the correct backend URL

### Logs:
- **Railway**: Check logs in Railway dashboard
- **Vercel**: Check function logs in Vercel dashboard
- **MongoDB Atlas**: Monitor database connections in Atlas dashboard

## Security Notes

1. **Never commit sensitive environment variables to Git**
2. **Use strong JWT secrets (minimum 32 characters)**
3. **Regularly rotate API keys and secrets**
4. **Monitor your application for security vulnerabilities**
5. **Keep dependencies updated**

## Performance Optimization

1. **Enable gzip compression** in your backend
2. **Optimize images** before uploading to Cloudinary
3. **Use CDN** for static assets
4. **Monitor application performance** using platform tools
5. **Implement caching** where appropriate

For additional help, refer to the documentation of each platform:
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
