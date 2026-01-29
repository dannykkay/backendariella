# 🚀 Quick Start Guide - Local Testing

This guide will help you get your backend API running locally in under 10 minutes!

## ⚡ Super Quick Setup (For the Impatient)

```bash
# 1. Navigate to the project
cd portfolio-backend

# 2. Install dependencies
npm install

# 3. Create .env file (copy from example)
cp .env.example .env

# 4. Edit .env with your credentials
nano .env  # or use any text editor

# 5. Start the server
npm run dev
```

Done! Your API is running at `http://localhost:5000`

## 📝 Detailed Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Express (web framework)
- Mongoose (MongoDB driver)
- Nodemailer (email sending)
- And other essential packages

### Step 2: Configure Environment Variables

#### 2.1 Create .env file

```bash
cp .env.example .env
```

#### 2.2 Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in (or create free account)
3. Create a new cluster (if you haven't)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your password
7. Replace `<database>` with `portfolio_db`

Example:
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/portfolio_db?retryWrites=true&w=majority
```

#### 2.3 Get Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if needed)
3. Scroll to "App passwords"
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. This is your `EMAIL_PASSWORD`

#### 2.4 Edit Your .env File

Open `.env` in your text editor and update:

```env
# Your MongoDB connection string
MONGODB_URI=mongodb+srv://...

# Your Gmail address
EMAIL_USER=your.email@gmail.com

# Your Gmail App Password (16 characters)
EMAIL_PASSWORD=abcd efgh ijkl mnop

# Email where you want to receive messages
EMAIL_TO=your.email@gmail.com

# Frontend URL (for local dev)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start the Server

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
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

## 🧪 Test Your API

### Test 1: Health Check

Open your browser and visit:
```
http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Portfolio API is running",
  "timestamp": "2024-01-15T12:34:56.789Z",
  "environment": "development"
}
```

✅ **If you see this, your server is running!**

### Test 2: Submit Test Form (Browser Console)

1. Open your portfolio website in browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Paste this code:

```javascript
fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    organization: 'Test Company',
    message: 'This is a test message to verify the contact form is working!'
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
```

Expected response in console:
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

✅ **Check your email - you should receive a message!**

### Test 3: Submit Test Form (cURL)

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "organization": "Test Company",
    "message": "This is a test message!"
  }'
```

### Test 4: Test Validation (Should Fail)

Try submitting invalid data:

```bash
# Missing required field
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email"
  }'
```

Expected response:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "message",
      "message": "Message is required"
    }
  ]
}
```

✅ **If validation works, your API is secure!**

### Test 5: Test Rate Limiting

Submit the form 6 times quickly (default limit is 5):

```bash
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/contact \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test $i\",\"email\":\"test@example.com\",\"message\":\"Test message number $i\"}"
  echo ""
done
```

The 6th request should fail with:
```json
{
  "success": false,
  "error": "Too many contact form submissions. Please try again later."
}
```

✅ **Rate limiting is working!**

## 🎨 Update Your Frontend

Now that your backend is running, update your frontend:

1. Copy `script-updated.js` to your frontend project
2. Replace your old `script.js` with it
3. Or manually update the fetch URL in your existing script

The key change is:
```javascript
// Old (placeholder)
console.log('Form submitted:', formData);

// New (actual API call)
const response = await fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

## 🔍 Verify Everything Works

### Checklist:

- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Email configuration verified
- [ ] Health endpoint returns 200 OK
- [ ] Can submit form successfully
- [ ] Receive email notification
- [ ] Form validation works
- [ ] Rate limiting works
- [ ] MongoDB stores the message

### Check MongoDB:

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Navigate to `portfolio_db` → `contacts`
4. You should see your test messages!

## 🐛 Common Issues

### Issue: "MongoDB connection error"

**Solution:**
1. Check your `MONGODB_URI` is correct
2. Ensure password doesn't have special characters (or URL encode them)
3. Add your IP to MongoDB Atlas whitelist:
   - MongoDB Atlas → Network Access
   - Add IP Address → Add Current IP

### Issue: "Email configuration error"

**Solution:**
1. Verify you're using an App Password, not your regular Gmail password
2. Check `EMAIL_USER` and `EMAIL_PASSWORD` are correct
3. Ensure 2-Step Verification is enabled on your Google Account
4. Try regenerating the App Password

### Issue: "EADDRINUSE: address already in use"

**Solution:**
Port 5000 is already in use. Either:
1. Kill the other process: `lsof -ti:5000 | xargs kill -9`
2. Or change the port in `.env`: `PORT=5001`

### Issue: "Cannot find module..."

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS errors from frontend

**Solution:**
1. Ensure `FRONTEND_URL` in `.env` matches your frontend URL
2. Check your frontend is running on the URL you specified
3. For local development, `http://localhost:3000` should work

## 📊 Monitor Your API

### View Logs

Your terminal shows real-time logs:
```
✅ Contact saved to database: 65abc123...
✅ Email sent successfully
POST /api/contact - 200 OK
```

### Check Database

MongoDB Atlas → Browse Collections → contacts collection

### Check Emails

Every successful submission sends an email to your `EMAIL_TO` address.

## 🚀 Ready for Production?

Once everything works locally:

1. Read `DEPLOYMENT-GUIDE.md` for deploying to Render.com
2. Update your frontend's API URL for production
3. Test thoroughly in production

## 🎉 Success!

If all tests pass, your backend API is fully functional and ready to handle contact form submissions!

**What's Next?**
- Deploy to Render.com (see DEPLOYMENT-GUIDE.md)
- Integrate with your live portfolio
- Start receiving real messages!

---

**Need Help?** Check the main README.md for detailed documentation and troubleshooting.
