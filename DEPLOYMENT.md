# Floxtime - Deployment Guide

## Security Features

✅ **Phone Number Protection**: Each person must provide their phone number when submitting their availability. This phone number is required to delete or modify their entry, preventing others from tampering with their data.

- Phone numbers are **hashed using SHA-256** before storage (not stored in plain text)
- Minimum 10 digits required
- Users must remember their phone number to delete their availability
- Deletion attempts without correct phone number will fail

## Prerequisites

1. **MongoDB Database**
   - Set up a free MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
   - Get your connection string

2. **Vercel Account**
   - Sign up at https://vercel.com (free tier is fine)

## Deployment Steps

### 1. Prepare Your MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you haven't already)
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel
   - Go to Network Access → Add IP Address → Allow Access from Anywhere
5. Get your connection string from "Connect" → "Connect your application"
   - Should look like: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Option B: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Nuxt.js
   - **Build Command**: `bun run build` (or leave default)
   - **Output Directory**: `.output` (should be auto-detected)

### 3. Set Environment Variables

**In Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add the following:

```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/floxtime?retryWrites=true&w=majority
```

Replace:
- `your-username` with your MongoDB username
- `your-password` with your MongoDB password
- `cluster` with your cluster name
- `floxtime` with your database name

**Important:** Add this to all environments (Production, Preview, Development)

### 4. Redeploy

After adding environment variables, trigger a new deployment:
- Go to Deployments → Click the three dots on the latest → Redeploy

## Using the App

### For Event Organizers
1. Share the deployed URL with friends/colleagues
2. Each person creates their own entry with:
   - Their name
   - Their phone number
   - Their available dates

### For Participants
1. Visit the shared URL
2. Click the **+** button
3. Enter:
   - Your name
   - Your phone number (10+ digits)
   - Select your available dates
4. Your phone number is used to manage your availability

### Viewing Availability
- **Month View**: See everyone's availability in calendar format
  - Darker colors = more people available
  - Hover over dates to see who's available
- **List View**: See detailed breakdown by person

### Deleting Your Availability
1. Switch to List View
2. Find your entry
3. Click the delete button
4. Enter your phone number when prompted

## Troubleshooting

### Build Fails
- Make sure `MONGODB_URI` is set in environment variables
- Check that your MongoDB cluster allows connections from anywhere (0.0.0.0/0)

### "Failed to connect to database"
- Verify MongoDB connection string is correct
- Ensure IP whitelist includes 0.0.0.0/0
- Check database user has read/write permissions

### Can't Delete Entry
- Verify you're entering the correct phone number
- Phone number must match exactly as entered during creation
- Contact the event organizer if you need help

## Custom Domain (Optional)

1. Go to your Vercel project → Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Cost

- **MongoDB Atlas**: Free tier (512 MB storage)
- **Vercel**: Free tier (unlimited deployments, 100 GB bandwidth)
- **Total**: $0/month for most use cases

## Security Notes

- ✅ Phone numbers are hashed (SHA-256) before storage
- ✅ No plain-text phone numbers stored
- ✅ Each person can only delete their own entries
- ⚠️ Phone numbers are used for authentication (simple and practical)
- ⚠️ Anyone with the URL can view all availability (not password protected for viewing)

## Maintenance

The app requires minimal maintenance:
- MongoDB Atlas handles database backups automatically
- Vercel handles SSL certificates and infrastructure
- No server management needed

## Support

For issues or questions:
1. Check the MongoDB Atlas connection string
2. Verify environment variables are set correctly in Vercel
3. Check Vercel deployment logs for error messages

