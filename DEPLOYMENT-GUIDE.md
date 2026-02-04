# 🚢 Complete Render.com Deployment Guide

This guide will walk you through deploying your portfolio backend API to Render.com step-by-step.

## 📋 Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] MongoDB Atlas account with cluster created
- [ ] MongoDB connection string ready
- [ ] Gmail account with App Password generated
- [ ] GitHub account
- [ ] All code tested locally and working
- [ ] Git repository initialized

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Code for Deployment

#### 1.1 Initialize Git Repository (if not done)

```bash
cd portfolio-backend
git init
git add .
git commit -m "Initial commit: Portfolio backend API"
```

#### 1.2 Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** icon → **"New repository"**
3. Name it: `portfolio-backend-api`
4. Keep it **Public** or **Private** (your choice)
5. **Don't** initialize with README (you already have one)
6. Click **"Create repository"**

#### 1.3 Push Code to GitHub

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/portfolio-backend-api.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 2: Set Up Render.com Account

1. Go to [Render.com](https://render.com)
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your GitHub account
5. You may be asked to install Render on specific repositories - install it on your portfolio backend repo

### Step 3: Create Web Service on Render

#### 3.1 Create New Service

1. From Render Dashboard, click **"New +"**
2. Select **"Web Service"**

#### 3.2 Connect Your Repository

1. Find your `portfolio-backend-api` repository in the list
2. Click **"Connect"**
3. If you don't see your repo, click **"Configure account"** to grant access

#### 3.3 Configure Service Settings

Fill in the following details:

**Basic Info:**
```
Name: portfolio-backend-api
(or any name you prefer - this will be part of your URL)
```

**Branch:**
```
main
```

**Root Directory:**
```
(leave blank)
```

**Environment:**
```
Node
```

**Region:**
```
Oregon (US West) or closest to you
```

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Instance Type:**
```
Free
(or upgrade to Starter for production use)
```

### Step 4: Configure Environment Variables

This is the most important step! In the Render dashboard:

1. Scroll down to **"Environment Variables"**
2. Click **"Add Environment Variable"**
3. Add each variable one by one:

```env
NODE_ENV
production

PORT
5000

MONGODB_URI
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/portfolio_db?retryWrites=true&w=majority

EMAIL_USER
your.email@gmail.com

EMAIL_PASSWORD
your_16_char_app_password

EMAIL_TO
your.email@gmail.com

FRONTEND_URL
https://your-portfolio-domain.com

RATE_LIMIT_MAX_REQUESTS
5

RATE_LIMIT_WINDOW_MINUTES
15
```

**Important Notes:**
- Copy values from your local `.env` file
- Don't add quotes around values
- Use your actual MongoDB connection string
- Use your Gmail App Password (not regular password)
- If you don't have a frontend domain yet, use a placeholder and update later

### Step 5: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will now:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Watch the deployment logs in real-time
4. Wait for deployment to complete (usually 2-5 minutes)

You should see logs like:
```
==> Starting service with 'npm start'
==> ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
==> ✅ Email configuration verified
==> Server running on port 5000
```

### Step 6: Get Your Deployed URL

Once deployment is complete:

1. Your service URL will be shown at the top
2. It will look like: `https://portfolio-backend-api.onrender.com`
3. Copy this URL - you'll need it for your frontend

### Step 7: Test Your Deployed API

#### 7.1 Test Health Endpoint

Open your browser and visit:
```
https://portariella.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Portfolio API is running",
  "timestamp": "2024-01-15T12:34:56.789Z",
  "environment": "production"
}
```

#### 7.2 Test Contact Endpoint with cURL

```bash
curl -X POST https://portariella.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "organization": "Test Org",
    "message": "This is a test message from Render deployment."
  }'
```

You should receive:
```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon.",
  "data": {
    "id": "...",
    "timestamp": "..."
  }
}
```

And you should receive an email!

### Step 8: Configure MongoDB Atlas for Render

Your MongoDB Atlas needs to allow connections from Render:

1. Go to MongoDB Atlas Dashboard
2. Click **"Network Access"** in the left sidebar
3. Click **"Add IP Address"**
4. Choose one option:

**Option A: Allow All (Easier, less secure)**
```
IP Address: 0.0.0.0/0
Description: Allow all
```

**Option B: Add Render's IP Ranges (More secure)**
Get Render's IP addresses from their docs and add each one.

5. Click **"Confirm"**

### Step 9: Update Your Frontend

Now update your frontend to use the production API:

In your `script.js` file, update the API configuration:

```javascript
const API_CONFIG = {
    development: 'http://localhost:5000',
    production: 'https://portfolio-backend-api.onrender.com', // ← Update this!
};
```

Or if you're using the auto-detection (recommended), it will automatically use the production URL when not on localhost!

### Step 10: Deploy Your Frontend

If you're using Render for your frontend too:

1. Create another Web Service for your frontend
2. Set the environment variable:
```
API_URL=https://portfolio-backend-api.onrender.com
```

If using Netlify, Vercel, or GitHub Pages, update your build configuration accordingly.

## 🔧 Post-Deployment Configuration

### Enable Automatic Deploys

By default, Render automatically deploys when you push to your main branch.

To disable:
1. Go to your service settings
2. Find **"Auto-Deploy"**
3. Toggle it off

To manually deploy:
1. Go to your service
2. Click **"Manual Deploy"**
3. Choose **"Deploy latest commit"**

### Set Up Custom Domain (Optional)

1. Go to your service **Settings**
2. Click **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain: `api.yourdomain.com`
5. Follow the DNS configuration instructions
6. Update `FRONTEND_URL` environment variable

### View Logs

To debug issues:
1. Go to your service
2. Click **"Logs"** tab
3. View real-time logs
4. Filter by date/time

### Scale Your Service

Free tier limitations:
- Spins down after 15 minutes of inactivity
- Cold start takes 30-60 seconds

To upgrade:
1. Go to service **Settings**
2. Find **"Instance Type"**
3. Upgrade to **"Starter"** ($7/month)
4. Benefits:
   - Always running (no spin down)
   - Faster response times
   - Better for production

## 🐛 Common Issues & Solutions

### Issue 1: Deployment Fails

**Symptom:** Build fails or service won't start

**Solutions:**
1. Check Render logs for specific error
2. Verify `package.json` has correct scripts:
   ```json
   "scripts": {
     "start": "node server.js"
   }
   ```
3. Ensure all dependencies are in `package.json`
4. Verify Node.js version compatibility
5. Check that `.env` variables are properly set

### Issue 2: MongoDB Connection Fails

**Symptom:** "MongoDB connection error" in logs

**Solutions:**
1. Verify `MONGODB_URI` is correct in Render environment variables
2. Check MongoDB Atlas IP whitelist includes 0.0.0.0/0
3. Ensure MongoDB user has correct permissions
4. Verify MongoDB cluster is running

### Issue 3: Emails Not Sending

**Symptom:** Forms submit but no emails received

**Solutions:**
1. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
2. Confirm you're using Gmail App Password (not regular password)
3. Check Gmail security settings
4. Look for emails in spam folder
5. Check Render logs for email errors

### Issue 4: CORS Errors from Frontend

**Symptom:** Browser console shows CORS errors

**Solutions:**
1. Add your frontend URL to `FRONTEND_URL` in Render
2. Ensure both http:// and https:// versions are handled
3. Check CORS configuration in `server.js`
4. Verify frontend is using correct API URL

### Issue 5: Service Spinning Down

**Symptom:** First request takes 30-60 seconds

**Solution:**
This is normal on free tier. To fix:
1. Upgrade to Starter plan ($7/month)
2. Or use a "ping" service to keep it awake
3. Or accept the cold start delay

## 📊 Monitoring Your API

### Check Service Health

Create a bookmark to your health endpoint:
```
https://portfolio-backend-api.onrender.com/api/health
```

Visit it daily to ensure your API is running.

### View Database Records

1. Go to MongoDB Atlas
2. Click **"Browse Collections"**
3. Navigate to `portfolio_db` → `contacts`
4. View all submitted messages

### Email Notifications

You'll receive an email for every form submission, containing:
- Sender's name and email
- Message content
- Timestamp
- Quick reply link

## 🔄 Making Updates

### To Update Your Code:

1. Make changes locally
2. Test thoroughly
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```
4. Render automatically deploys the changes
5. Watch deployment logs
6. Test the updated API

### To Update Environment Variables:

1. Go to Render Dashboard
2. Select your service
3. Click **"Environment"**
4. Update or add variables
5. Click **"Save Changes"**
6. Service will automatically restart

## 🎉 Success Checklist

Deployment is complete when you can check all these:

- [ ] Service is deployed and showing "Live"
- [ ] Health endpoint returns 200 OK
- [ ] Can submit test form successfully
- [ ] Receive test email in inbox
- [ ] MongoDB Atlas shows new contact record
- [ ] Frontend connects to API without errors
- [ ] CORS is working correctly
- [ ] Rate limiting is active
- [ ] No errors in Render logs
- [ ] Custom domain configured (if applicable)

## 🚀 Next Steps

1. **Monitor Your API:**
   - Check logs regularly
   - Review submitted messages in MongoDB
   - Monitor email deliverability

2. **Consider Upgrading:**
   - If getting regular traffic, upgrade to Starter plan
   - Eliminates cold starts
   - Better for user experience

3. **Add Monitoring:**
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure alerts for downtime
   - Track response times

4. **Backup Your Data:**
   - MongoDB Atlas has automatic backups
   - Consider exporting contacts periodically
   - Keep backup of environment variables

## 🆘 Need Help?

If you run into issues:

1. **Check Render Logs:**
   - Most errors are visible here
   - Look for red error messages

2. **Check MongoDB Atlas:**
   - Verify connection string
   - Check IP whitelist
   - Ensure cluster is running

3. **Test Locally First:**
   - If it works locally but not on Render
   - Compare environment variables
   - Check for hardcoded values

4. **Render Documentation:**
   - [Render Node.js Docs](https://render.com/docs/deploy-node-express-app)
   - [Troubleshooting Guide](https://render.com/docs/troubleshooting)

5. **Community Support:**
   - Render Community Forum
   - Stack Overflow
   - GitHub Issues

---

## 🎊 Congratulations!

Your portfolio backend API is now live and ready to handle contact form submissions!

**Your API URLs:**
- Health: `https://your-service.onrender.com/api/health`
- Contact: `https://your-service.onrender.com/api/contact`

Update your frontend with these URLs and you're all set! 🚀
