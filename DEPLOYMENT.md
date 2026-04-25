# 🚀 Deployment Guide

This guide covers deploying the BloodBank application to production using Vercel (frontend) and various hosting options for the backend.

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with repository pushed
- Vercel account (free at vercel.com)

### Step-by-Step

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Select "client" as the root directory
   - Click "Deploy"

3. **Set Environment Variables**
   - In Vercel dashboard: Settings → Environment Variables
   - Add: `VITE_API_URL` = your backend API URL
   - Example: `https://api.yourdomain.com/api`

4. **Domain Setup** (Optional)
   - In Settings → Domains
   - Add your custom domain
   - Configure DNS records

5. **Automatic Deployments**
   - Vercel automatically deploys on push to main
   - View logs: Deployments → Details

## Backend Deployment

### Option 1: Render.com (Recommended for Free)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Backend ready"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New +" → Web Service
   - Connect your repository
   - Select `server` directory
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment: Node

4. **Add Environment Variables**
   - In "Environment" tab, add:
     ```
     MONGODB_URI=<your-mongodb-url>
     JWT_SECRET=<secure-random-key>
     NODE_ENV=production
     CORS_ORIGIN=https://yourdomain.vercel.app
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Get your service URL

### Option 2: Railway.app

1. **Create Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - New Project → Deploy from GitHub repo
   - Select your repository
   - Authorize Railway

3. **Add MongoDB Service**
   - Add Database → MongoDB
   - Railway creates `MONGODB_URI` automatically

4. **Configure Server**
   - Point to `server` directory
   - Add environment variables:
     - `JWT_SECRET` - secure random string
     - `CORS_ORIGIN` - your frontend URL
     - `NODE_ENV` - production

5. **Deploy**
   - Push to trigger deployment
   - Get your API URL from Railway dashboard

### Option 3: Heroku (Paid)

1. **Create Account** - [heroku.com](https://heroku.com)

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI=<your-url>
   heroku config:set JWT_SECRET=<key>
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   heroku logs --tail
   ```

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud) - Recommended

1. **Create Account** - [mongodb.com/cloud](https://www.mongodb.com/cloud)

2. **Create Free Cluster**
   - Click "Build a Database"
   - Choose M0 Sandbox (free)
   - Select region closest to you
   - Create cluster

3. **Add Database User**
   - Security → Database Access
   - Create database user (username/password)
   - Note down credentials

4. **Get Connection String**
   - Clusters → Connect
   - Choose "Drivers" → Node.js
   - Copy connection string
   - Replace `<username>` and `<password>`

5. **Example Connection String**
   ```
   mongodb+srv://username:password@cluster0.mongodb.net/blood-bank?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

```bash
# Install MongoDB
# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start service
brew services start mongodb-community

# Connection string for development
mongodb://localhost:27017/blood-bank
```

## Environment Variables Reference

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/blood-bank

# Security
JWT_SECRET=use-a-secure-random-string-here

# CORS - Must match frontend URL
CORS_ORIGIN=https://yourdomain.vercel.app
```

### Frontend (Vercel)
```
VITE_API_URL=https://your-api.onrender.com/api
```

## Testing After Deployment

1. **Frontend**
   ```bash
   # Should load without errors
   https://yourdomain.vercel.app
   ```

2. **API Health**
   ```bash
   curl https://your-api.onrender.com/api
   ```

3. **Registration**
   - Visit frontend
   - Register new account
   - Check if data saves in MongoDB

4. **Login**
   - Login with credentials
   - Verify token in localStorage
   - Check if API calls work

## Monitoring & Debugging

### Vercel
- Deployments tab - view build logs
- Logs tab - real-time function logs
- Analytics - performance metrics

### Render/Railway
- Logs - error tracking
- Metrics - CPU, memory, requests
- Environment - verify variables

### MongoDB Atlas
- Metrics - database performance
- Logs - query history
- Alerts - set up notifications

## Custom Domain

1. **Purchase Domain** (GoDaddy, Namecheap, etc.)

2. **Configure DNS** in Vercel
   - Settings → Domains
   - Add your domain
   - Follow DNS instructions

3. **Update CORS_ORIGIN**
   - Set to your domain in backend

4. **Wait for DNS Propagation** (24-48 hours)

## Security Checklist

- [ ] JWT_SECRET is secure and unique
- [ ] MONGODB_URI has authentication enabled
- [ ] CORS_ORIGIN matches your domain
- [ ] NODE_ENV=production
- [ ] No sensitive data in .env.example
- [ ] .env file is in .gitignore
- [ ] HTTPS enabled (automatic on Vercel)

## Troubleshooting

### CORS Errors
- Check `CORS_ORIGIN` matches exactly
- Ensure backend is running
- Check frontend making correct requests

### MongoDB Connection
- Verify connection string
- Check IP whitelist in Atlas
- Ensure user/password are correct
- Verify database name in URL

### Deployment Fails
- Check build logs for errors
- Verify environment variables
- Ensure correct root directory
- Check Node version compatibility

### Blank Page After Deploy
- Check browser console for errors
- Verify VITE_API_URL is correct
- Check if API is responding
- Clear cache and refresh

## Support

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Render Docs: [render.com/docs](https://render.com/docs)
- MongoDB Docs: [mongodb.com/docs](https://mongodb.com/docs)

---

Happy deploying! 🚀
