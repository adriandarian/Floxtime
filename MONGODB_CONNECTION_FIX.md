# Fix MongoDB TLS Error on Vercel

## ⚠️ Your Error:
```
Failed to connect to MongoDB: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

## 🔧 Quick Fix:

### The Problem:
You're likely using `mongodb://` instead of `mongodb+srv://` in your connection string.

### The Solution:

#### Step 1: Get the Correct Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Connect"** button on your cluster
3. Choose **"Drivers"**
4. Select **Node.js** driver (latest version)
5. Copy the **SRV connection string**

#### Step 2: Format It Correctly

Your connection string **MUST** look like this:

```
mongodb+srv://username:password@cluster.mongodb.net/floxtime?retryWrites=true&w=majority
```

**Key Points:**
- ✅ Starts with `mongodb+srv://` (NOT `mongodb://`)
- ✅ Has your cluster name (e.g., `cluster0.abc123.mongodb.net`)
- ✅ Includes database name after the `/` (e.g., `/floxtime`)
- ✅ Has query parameters `?retryWrites=true&w=majority`

#### Step 3: URL Encode Special Characters in Password

If your password has special characters, encode them:

| Character | Replace With |
|-----------|--------------|
| `@`       | `%40`        |
| `:`       | `%3A`        |
| `/`       | `%2F`        |
| `?`       | `%3F`        |
| `#`       | `%23`        |
| `&`       | `%26`        |
| `%`       | `%25`        |

**Example:**
- Password: `My@Pass:123`
- Encoded: `My%40Pass%3A123`
- Full string: `mongodb+srv://user:My%40Pass%3A123@cluster.mongodb.net/floxtime?retryWrites=true&w=majority`

#### Step 4: Update in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **floxtime** project
3. Go to **Settings** → **Environment Variables**
4. Find `MONGODB_URI` and click **Edit**
5. Paste your new connection string
6. Click **Save**

#### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click the **⋮** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## ✅ Verify It Works

After redeploying:
1. Visit your Vercel app URL
2. Check if data loads
3. If still errors, go to Vercel → Deployments → Functions → Check logs

You should see:
```
✅ Connecting to MongoDB...
✅ MongoDB connected successfully
```

## ❌ What NOT to Use

**Wrong (causes TLS errors):**
```
mongodb://cluster.mongodb.net:27017/floxtime  ❌
mongodb://user:pass@host:27017  ❌
```

**Correct:**
```
mongodb+srv://user:pass@cluster.mongodb.net/floxtime?retryWrites=true&w=majority  ✅
```

## 🆘 Still Not Working?

### Check MongoDB Network Access:
1. MongoDB Atlas → **Network Access**
2. Make sure you have **0.0.0.0/0** in the IP Access List
3. If not, click **Add IP Address** → **Allow Access from Anywhere**

### Get Fresh Connection String:
Sometimes the cluster address changes. Always get a fresh connection string from MongoDB Atlas.

### Check Vercel Logs:
Go to: Vercel Dashboard → Your Project → Deployments → Latest → Functions

Look for the actual error message and it will tell you what's wrong.

## 📝 Full Example

Here's a complete working example:

```bash
# In Vercel Environment Variables, set:
MONGODB_URI=mongodb+srv://myuser:MySecurePass123@cluster0.abc123.mongodb.net/floxtime?retryWrites=true&w=majority
```

Replace:
- `myuser` → Your MongoDB username
- `MySecurePass123` → Your MongoDB password (URL-encoded if needed)
- `cluster0.abc123.mongodb.net` → Your cluster address
- `floxtime` → Your database name

That's it! This should fix the TLS error. 🎉

