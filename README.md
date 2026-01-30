# Portfolio Contact API Backend

A clean, production-ready RESTful API backend for Damilola Oyedeji's portfolio contact form. Built with Node.js, Express, MongoDB, and Nodemailer.

## ✨ Features

- ✅ RESTful API design
- ✅ MongoDB database storage
- ✅ Email notifications via Gmail
- ✅ Rate limiting to prevent spam
- ✅ Input validation and sanitization
- ✅ Security best practices (Helmet, CORS)
- ✅ Professional HTML email templates
- ✅ Error handling and logging
- ✅ Ready for Render.com deployment

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas Account** (free tier) - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Gmail Account** with App Password enabled

## 🚀 Quick Start

### 1. Installation

```bash
# Clone or download the project
cd portfolio-backend

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/portfolio_db

# Email Configuration
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_TO=your.email@gmail.com

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and new cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `<database_name>` with `portfolio_db`
7. Paste into your `.env` file as `MONGODB_URI`

**Important:** Add your IP address to the IP Whitelist in MongoDB Atlas:
- Go to "Network Access" in MongoDB Atlas
- Click "Add IP Address"
- For development, you can allow access from anywhere (0.0.0.0/0)
- For production, add your Render.com IP address

### 4. Set Up Gmail App Password

**You MUST use an App Password, not your regular Gmail password!**

1. Go to your [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Name it "Portfolio API"
6. Copy the 16-character password
7. Paste it into your `.env` file as `EMAIL_PASSWORD`

### 5. Run the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

You should see:

```
========================================
🚀 Portfolio Contact API
========================================
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📦 Database: portfolio_db
✅ Email configuration verified
Environment: development
Server running on port 5000
URL: http://localhost:5000
========================================
```

## 🧪 Testing the API

### Test with cURL

```bash
# Health check
curl http://localhost:5000/api/health

# Submit contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "organization": "Test Org",
    "message": "This is a test message for the contact form."
  }'
```

### Test with Postman

1. Open Postman
2. Create a new POST request to `http://localhost:5000/api/contact`
3. Set Headers: `Content-Type: application/json`
4. Add JSON body:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "organization": "Test Org",
  "message": "This is a test message."
}
```
5. Send the request

Expected response:
```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon.",
  "data": {
    "id": "65abc123...",
    "timestamp": "2024-01-15T12:34:56.789Z"
  }
}
```

## 📡 API Endpoints

### POST /api/contact

Submit a contact form message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "organization": "Optional Company",  // optional
  "message": "Your message here"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Thank you for your message! I'll get back to you soon.",
  "data": {
    "id": "65abc123...",
    "timestamp": "2024-01-15T12:34:56.789Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": "Too many contact form submissions. Please try again later."
}
```

### GET /api/health

Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "Portfolio API is running",
  "timestamp": "2024-01-15T12:34:56.789Z",
  "environment": "production"
}
```

### GET /api/contact/health

Check contact route health.

**Response:**
```json
{
  "success": true,
  "message": "Contact API is running",
  "timestamp": "2024-01-15T12:34:56.789Z"
}
```

## 🎨 Frontend Integration

Update your `script.js` file to integrate with the API:

```javascript
// Find the contactForm submit handler (around line 212)
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        organization: document.getElementById('organization').value.trim(),
        message: document.getElementById('message').value.trim()
    };
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    try {
        // Send to backend API
        const response = await fetch('http://localhost:5000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Show success message
            submitButton.textContent = '✓ Message Sent!';
            submitButton.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            submitButton.style.transform = 'scale(1.05)';
            
            // Reset form
            contactForm.reset();
            
            // Optional: Show a better success notification
            alert(data.message);
        } else {
            // Handle error
            throw new Error(data.error || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('Error:', error);
        submitButton.textContent = '✗ Failed to Send';
        submitButton.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        alert('Failed to send message. Please try again later.');
    } finally {
        // Reset button after 3 seconds
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.style.background = '';
            submitButton.style.transform = '';
            submitButton.disabled = false;
        }, 3000);
    }
});
```

**Important:** Update the API URL in production:
- Development: `http://localhost:5000/api/contact`
- Production: `https://your-backend.onrender.com/api/contact`

## 🚢 Deployment to Render.com

### Step 1: Prepare for Deployment

1. Make sure all your code is committed to a Git repository (GitHub, GitLab, etc.)
2. Ensure your `.env` file is in `.gitignore` (it should be by default)
3. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Portfolio backend API"
git branch -M main
git remote add origin https://github.com/yourusername/portfolio-backend.git
git push -u origin main
```

### Step 2: Create Render Account

1. Go to [Render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 3: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

**Basic Settings:**
- **Name:** `portfolio-backend-api` (or your preferred name)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave blank (or specify if in subdirectory)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free` (or upgrade as needed)

### Step 4: Add Environment Variables

In the Render dashboard, go to **"Environment"** and add these variables:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_TO=your.email@gmail.com
FRONTEND_URL=https://your-portfolio-domain.com
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_WINDOW_MINUTES=15
```

**Important Notes:**
- Don't wrap values in quotes
- Use your production MongoDB connection string
- Set `FRONTEND_URL` to your actual portfolio domain
- If you don't have a custom domain yet, you'll update this later

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your server
3. Wait for deployment to complete (usually 2-5 minutes)
4. You'll get a URL like: `https://portfolio-backend-api.onrender.com`

### Step 6: Update MongoDB Atlas

1. Go to MongoDB Atlas → **Network Access**
2. Add Render's IP addresses or allow access from anywhere (0.0.0.0/0)
3. Save changes

### Step 7: Update Frontend

Update your frontend's API URL to your Render URL:

```javascript
// In script.js, update the fetch URL
const response = await fetch('https://portfolio-backend-api.onrender.com/api/contact', {
    // ... rest of the code
});
```

### Step 8: Test Your Deployment

1. Visit your Render URL: `https://portfolio-backend-api.onrender.com`
2. Test health endpoint: `https://portfolio-backend-api.onrender.com/api/health`
3. Submit a test form from your frontend

### Important Render.com Notes

- **Free Tier Limitations:**
  - Service spins down after 15 minutes of inactivity
  - First request after spindown takes 30-60 seconds
  - Consider upgrading to paid tier for production use

- **Custom Domain:**
  - You can add a custom domain in Render settings
  - Example: `api.yourdomain.com`

- **Automatic Deploys:**
  - Render automatically redeploys when you push to main
  - You can disable this in settings if needed

- **Logs:**
  - View real-time logs in the Render dashboard
  - Essential for debugging issues

## 📁 Project Structure

```
portfolio-backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── email.js              # Email configuration & templates
├── middleware/
│   ├── errorHandler.js       # Error handling
│   ├── rateLimiter.js        # Rate limiting
│   └── validation.js         # Input validation
├── models/
│   └── Contact.js            # Contact message schema
├── routes/
│   └── contact.js            # Contact routes & controllers
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── package.json              # Dependencies & scripts
├── server.js                 # Main server file
└── README.md                 # This file
```

## 🔒 Security Features

- **Helmet.js:** Security headers
- **CORS:** Cross-origin resource sharing protection
- **Rate Limiting:** Prevents spam (5 requests per 15 minutes)
- **Input Validation:** Sanitizes and validates all inputs
- **Environment Variables:** Sensitive data never in code
- **Error Handling:** Secure error messages (no sensitive info leaked)

## 🐛 Troubleshooting

### MongoDB Connection Fails

**Problem:** Can't connect to MongoDB Atlas

**Solutions:**
1. Check your connection string in `.env`
2. Verify your MongoDB Atlas password is correct
3. Add your IP address to MongoDB Atlas IP Whitelist
4. Ensure database name is correct in connection string

### Email Not Sending

**Problem:** Emails not being received

**Solutions:**
1. Verify you're using an App Password, not regular password
2. Check Gmail security settings
3. Look for emails in spam folder
4. Verify `EMAIL_USER` and `EMAIL_TO` are correct
5. Check server logs for error messages

### CORS Errors

**Problem:** Frontend can't connect to API

**Solutions:**
1. Add your frontend URL to `FRONTEND_URL` in `.env`
2. Ensure CORS is properly configured in `server.js`
3. Check browser console for specific CORS error
4. For local development, add `http://localhost:3000` to allowed origins

### Rate Limit Hit

**Problem:** "Too many requests" error

**Solutions:**
1. Wait 15 minutes for rate limit to reset
2. Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env` if needed
3. Check if someone is spamming your form
4. Consider implementing CAPTCHA on frontend

### Render Deployment Issues

**Problem:** Deployment fails or service doesn't start

**Solutions:**
1. Check Render logs for specific error
2. Verify all environment variables are set correctly
3. Ensure `package.json` has correct start script
4. Check MongoDB Atlas allows Render's IP addresses
5. Verify Node.js version compatibility

## 📊 Monitoring & Maintenance

### View Submitted Messages

You can view messages directly in MongoDB Atlas:

1. Go to MongoDB Atlas Dashboard
2. Click "Browse Collections"
3. Navigate to `portfolio_db` → `contacts`
4. View all submitted messages with timestamps

### Check API Health

Visit these endpoints regularly:
- `https://your-backend.onrender.com/api/health`
- `https://your-backend.onrender.com/api/contact/health`

### Email Notifications

Every form submission sends an email to `EMAIL_TO` with:
- Sender's name and email
- Organization (if provided)
- Message content
- Timestamp
- Direct reply-to link

## 🔄 Future Enhancements

Consider adding:
- [ ] Admin dashboard to view messages
- [ ] Email templates customization
- [ ] SMS notifications (Twilio)
- [ ] Spam detection (Akismet)
- [ ] Analytics tracking
- [ ] File upload support
- [ ] Auto-reply emails
- [ ] Database backups

## 📝 License

MIT License - Feel free to use this for your own projects!

## 🤝 Support

If you encounter any issues:

1. Check this README thoroughly
2. Review the troubleshooting section
3. Check Render logs for errors
4. Verify all environment variables
5. Test with cURL or Postman first

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Gmail App Password generated
- [ ] `.env` file configured with all variables
- [ ] Local server runs without errors
- [ ] Can submit test message locally
- [ ] Receive test email successfully
- [ ] Code pushed to GitHub
- [ ] Render service created and deployed
- [ ] Production environment variables set
- [ ] MongoDB allows Render IP addresses
- [ ] Frontend updated with production API URL
- [ ] Production test successful
- [ ] Contact form working on live site

---

**Built with ❤️ for Damilola Oyedeji's Portfolio**

Questions? Check the troubleshooting section or review the code comments for detailed explanations.
#   b a c k e n d a r i e l l a  
 #   b a c k e n d a r i e l l a  
 