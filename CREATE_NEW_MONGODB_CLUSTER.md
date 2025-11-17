# 🚨 Create Fresh MongoDB Cluster (TLS Issue Fix)

## Problem Identified:
Your logs show:
- ✅ Connection string format is CORRECT (`mongodb+srv://`)
- ❌ TLS handshake is FAILING between Vercel and MongoDB

This means the **MongoDB cluster itself** has a TLS/SSL configuration issue.

## 🔧 Solution: Create a Fresh Cluster

### Step 1: Create New Cluster in MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Click **"+ Create"** button (top right)
3. Choose **"Build a Database"**
4. Select **FREE (M0)** tier
5. **IMPORTANT**: Choose these settings:
   - **Provider**: AWS (recommended for Vercel)
   - **Region**: `us-east-1` (Virginia) - **Same region as your Vercel deployment**
   - **Cluster Name**: `floxtime-cluster` (or any name)
6. Click **"Create Cluster"**
7. Wait 3-5 minutes for cluster to be ready

### Step 2: Create Database User

1. You'll see "Security Quickstart"
2. **Authentication Method**: Username and Password
3. **Username**: `floxtime_user` (or whatever you want)
4. **Password**: Click "Autogenerate Secure Password" 
   - **COPY THIS PASSWORD IMMEDIATELY** (you'll need it)
   - Or create your own (use only letters and numbers, no special chars for simplicity)
5. Click **"Create User"**

### Step 3: Set Network Access

1. Under "Where would you like to connect from?"
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. Then also click **"Add a Different IP Address"**
5. Enter `0.0.0.0/0` (allows all IPs - needed for Vercel)
6. Click **"Add Entry"**
7. Click **"Finish and Close"**

### Step 4: Get Connection String

1. Click **"Connect"** on your new cluster
2. Choose **"Drivers"**
3. Select **"Node.js"** and latest version
4. Copy the connection string (starts with `mongodb+srv://`)
5. It will look like:
   ```
   mongodb+srv://floxtime_user:<password>@floxtime-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Format the Connection String

Modify the connection string you just copied:

1. Replace `<password>` with your actual password
2. Add `/floxtime` before the `?` to specify the database name

**Final format:**
```
mongodb+srv://floxtime_user:YourPasswordHere@floxtime-cluster.xxxxx.mongodb.net/floxtime?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://floxtime_user:MySecurePass123@floxtime-cluster.abc123.mongodb.net/floxtime?retryWrites=true&w=majority
```

### Step 6: Update Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Click your **floxtime** project
3. **Settings** → **Environment Variables**
4. Find `MONGODB_URI` and click **Edit** (⋮ menu)
5. **DELETE the old value completely**
6. **Paste your NEW connection string** (from the new cluster)
7. Make sure it's set for all environments (Production, Preview, Development)
8. Click **"Save"**

### Step 7: Redeploy

1. Go to **"Deployments"** tab
2. Click **⋮** (three dots) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2 minutes)

### Step 8: Test It

1. Visit https://floxtime.vercel.app
2. It should load without errors!
3. Try adding an availability to confirm database writes work

## 🔍 Verify Success

Check the Function Logs again:
1. Vercel → Deployments → Latest → Functions → `/api/people`

You should now see:
```
✅ Connecting to MongoDB...
✅ URI format check: mongodb+srv://
✅ MongoDB connected successfully
```

## 💡 Why This Works

A fresh cluster ensures:
- ✅ Latest TLS/SSL configuration
- ✅ Proper certificate setup
- ✅ Compatible with Vercel's serverless environment
- ✅ No corrupted settings from old cluster

## ⚠️ Important Tips

1. **Password Tips**:
   - Use letters and numbers only (A-Z, a-z, 0-9)
   - Avoid special characters if possible
   - If you must use special chars, URL-encode them

2. **Region Matching**:
   - Your Vercel deployment is in `iad1` (us-east-1)
   - Choose MongoDB `us-east-1` region for best performance

3. **Keep Both Clusters**:
   - Don't delete your old cluster yet
   - Once new cluster works, you can migrate data if needed
   - Then delete old cluster

## 🔄 If You Need to Migrate Data

If you had data in the old cluster:

1. Get it working with the new cluster first
2. Use MongoDB Compass or mongodump/mongorestore to migrate
3. Or manually export/import through Atlas

## 🆘 Still Not Working?

If even a fresh cluster doesn't work, try:

1. **Different Provider/Region**:
   - Try Google Cloud or Azure instead of AWS
   - Try a different region (us-west-2, etc.)

2. **Upgrade Cluster**:
   - Although rare, try M10 tier (paid) for better support
   - Some TLS features might be better on paid tiers

3. **Check Vercel Limits**:
   - Make sure you're not hitting any Vercel limits
   - Check Vercel status page

---

**Creating a fresh cluster should fix the TLS handshake error!** 🎉

