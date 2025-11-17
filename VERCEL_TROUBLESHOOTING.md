# Vercel Deployment Troubleshooting

## Current Error: 500 Internal Server Error

You're seeing this error because the API can't connect to MongoDB. Follow these steps:

## Step 1: Check Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`floxtime`)
3. Go to **Settings** → **Environment Variables**
4. Check if `MONGODB_URI` exists

### If `MONGODB_URI` is missing:

1. Click **Add New**
2. **Name**: `MONGODB_URI`
3. **Value**: Your MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`)
4. **Environments**: Check all three boxes (Production, Preview, Development)
5. Click **Save**
6. **Important**: Go to **Deployments** tab and **Redeploy** the latest deployment

### If `MONGODB_URI` exists but still errors:

Check the value is correct (no extra spaces, complete connection string)

## Step 2: Check MongoDB Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click **Network Access** (left sidebar)
4. Check if you have an entry for **0.0.0.0/0** (Allow access from anywhere)

### If 0.0.0.0/0 is NOT in the list:

1. Click **Add IP Address**
2. Click **Allow Access from Anywhere**
3. It will add **0.0.0.0/0**
4. Click **Confirm**
5. Wait 1-2 minutes for it to take effect

**Why**: Vercel runs on dynamic IPs, so you need to allow all IPs.

## Step 3: Verify MongoDB Connection String

Your connection string should look like:
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
```

Common issues:
- ❌ Missing `+srv` → Should be `mongodb+srv://`
- ❌ Special characters in password not URL-encoded
- ❌ Wrong cluster name
- ❌ Missing database name

### To get the correct string:

1. Go to MongoDB Atlas
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<database>` with your database name (e.g., `floxtime`)

## Step 4: Check Vercel Function Logs

1. Go to your Vercel project
2. Click **Deployments** tab
3. Click on the latest deployment
4. Click **Functions** tab
5. Look for the `/api/people` function
6. Check the logs for specific error messages

Look for:
- "MONGODB_URI is missing!" → Environment variable not set
- "Failed to connect to MongoDB" → Connection string or network issue
- "getaddrinfo ENOTFOUND" → Invalid cluster URL

## Step 5: Test Locally First

Before deploying, test locally with the production MongoDB:

```bash
# Create a .env file (if you don't have one)
echo "MONGODB_URI=your_mongodb_connection_string" > .env

# Run dev server
bun run dev

# Or if using npm
npm run dev
```

Visit `http://localhost:3000` and see if it works locally.

## Step 6: Redeploy After Fixes

After making any changes:

1. If you changed environment variables → **Redeploy** in Vercel
2. If you changed code → `git push` (triggers auto-deploy)

## Quick Checklist

- [ ] `MONGODB_URI` is set in Vercel Environment Variables (all 3 environments)
- [ ] MongoDB Network Access includes `0.0.0.0/0`
- [ ] Connection string format is correct (`mongodb+srv://...`)
- [ ] Password in connection string is URL-encoded (if special chars)
- [ ] Database name is included in connection string
- [ ] Redeployed after setting environment variables

## Common Solutions

### Solution 1: Password with Special Characters

If your MongoDB password has special characters, URL-encode them:

| Character | Encoded |
|-----------|---------|
| `@`       | `%40`   |
| `:`       | `%3A`   |
| `/`       | `%2F`   |
| `?`       | `%3F`   |
| `#`       | `%23`   |
| `&`       | `%26`   |

Example:
- Password: `P@ss:word!`
- Encoded: `P%40ss%3Aword!`

### Solution 2: Create New Database User

Sometimes permissions are the issue:

1. MongoDB Atlas → Database Access
2. Add New Database User
3. Built-in Role: **Read and write to any database**
4. Create user
5. Update `MONGODB_URI` with new credentials
6. Redeploy

## Still Not Working?

Check the exact error in Vercel Function Logs and share:
1. The error message from Vercel logs
2. Confirm `MONGODB_URI` is set (don't share the actual value)
3. Confirm `0.0.0.0/0` is in MongoDB Network Access

## Expected Logs (Success)

When working correctly, Vercel function logs should show:
```
Connecting to MongoDB...
MongoDB connected successfully
```

If you see these, but still getting errors in browser, clear browser cache and hard refresh.

