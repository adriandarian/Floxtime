# 🚨 URGENT: MongoDB TLS Error Fix

## Your Current Error:
```
tlsv1 alert internal error: SSL alert number 80
```

This means **your connection string in Vercel is using the wrong format**.

## 🔴 THE PROBLEM:

You're using this format (WRONG):
```
mongodb://username:password@cluster.mongodb.net:27017/database
```

You MUST use this format (CORRECT):
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## ✅ FIX IT NOW (5 steps):

### Step 1: Get New Connection String

1. Open [MongoDB Atlas](https://cloud.mongodb.com)
2. Find your cluster
3. Click the **"Connect"** button
4. Select **"Connect your application"** (or "Drivers")
5. Make sure **"Node.js"** is selected
6. You'll see a connection string like:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 2: Customize It

Replace these parts:
- `<username>` → Your MongoDB username
- `<password>` → Your MongoDB password
- Add your database name: `mongodb+srv://user:pass@cluster.mongodb.net/floxtime?retryWrites=true&w=majority`

**Example:**
```
mongodb+srv://myuser:MyPassword123@cluster0.abc123.mongodb.net/floxtime?retryWrites=true&w=majority
```

### Step 3: Handle Special Characters in Password

If your password has special characters, encode them:

```
@ → %40
: → %3A
/ → %2F
? → %3F
# → %23
& → %26
= → %3D
```

**Example with special chars:**
- Password: `My@Pass:123`
- Encoded: `My%40Pass%3A123`
- Full: `mongodb+srv://user:My%40Pass%3A123@cluster.mongodb.net/floxtime?retryWrites=true&w=majority`

### Step 4: Update Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Click on your **floxtime** project
3. Click **"Settings"** (top navigation)
4. Click **"Environment Variables"** (left sidebar)
5. Find `MONGODB_URI`
6. Click **"Edit"** (⋮ menu → Edit)
7. **DELETE the old value completely**
8. **Paste your NEW connection string** (starting with `mongodb+srv://`)
9. Click **"Save"**

### Step 5: Redeploy

**IMPORTANT**: Just saving the environment variable is NOT enough. You MUST redeploy.

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click the **⋮** (three dots) button
4. Click **"Redeploy"**
5. Wait for it to finish

## 🔍 How to Verify

After redeploying, check the Function Logs:

1. Go to **Deployments** → Click on latest deployment
2. Click **"Functions"** tab
3. Click on `/api/people`
4. Look for these logs:

**SUCCESS** (what you want to see):
```
Connecting to MongoDB...
URI format check: mongodb+srv://
✅ MongoDB connected successfully
```

**FAILURE** (if still wrong):
```
URI format check: mongodb://
⚠️ WARNING: Using mongodb:// instead of mongodb+srv://
```

## 🆘 If Still Not Working

### Check These:

1. **Connection String Format**
   ```bash
   # WRONG ❌
   mongodb://...
   
   # CORRECT ✅
   mongodb+srv://...
   ```

2. **Network Access in MongoDB**
   - Go to MongoDB Atlas → Network Access
   - You MUST have `0.0.0.0/0` (Allow access from anywhere)
   - If not, add it and wait 2 minutes

3. **Database Name**
   - Your connection string should have `/DATABASE_NAME` before the `?`
   - Example: `.../floxtime?retryWrites=true...`

4. **Get Fresh Cluster**
   - If nothing works, the cluster might be corrupted
   - Create a NEW cluster in MongoDB Atlas
   - Get the connection string from the new cluster
   - Update Vercel environment variable

## 📊 Visual Guide

```
❌ BAD (causes TLS error):
mongodb://user:pass@host:27017/db

✅ GOOD (works):
mongodb+srv://user:pass@host/db?retryWrites=true&w=majority
         ^^^                  ^
         Must have +srv       Database name here
```

## 🎯 Common Mistakes

1. ❌ Using `mongodb://` instead of `mongodb+srv://`
2. ❌ Not URL-encoding special characters in password
3. ❌ Forgetting to redeploy after changing environment variable
4. ❌ Not having `0.0.0.0/0` in MongoDB Network Access
5. ❌ Missing database name in connection string

## ✅ Checklist

- [ ] Connection string starts with `mongodb+srv://`
- [ ] Special characters in password are URL-encoded
- [ ] Database name is included (e.g., `/floxtime`)
- [ ] Environment variable is updated in Vercel
- [ ] Redeployed after updating environment variable
- [ ] MongoDB Network Access has `0.0.0.0/0`

## 💡 Pro Tip

Test your connection string locally first:

```bash
# Create a .env file
echo "MONGODB_URI=your_connection_string_here" > .env

# Run locally
bun run dev

# Open http://localhost:3000
# If it works locally, it will work on Vercel
```

---

**After following these steps, it WILL work. The TLS error only happens when the connection string format is wrong.** 🎉

