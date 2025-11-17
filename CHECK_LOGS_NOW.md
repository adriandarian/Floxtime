# 🔍 Check Your Vercel Function Logs NOW

## Your deployment should now have detailed error messages.

### Step-by-Step: Check What's Wrong

#### 1. Open Vercel Function Logs

1. Go to: https://vercel.com/dashboard
2. Click on your **floxtime** project
3. Click **"Deployments"** tab at the top
4. Click on the **latest deployment** (top of the list)
5. Click **"Functions"** tab
6. Find and click on **`/api/people`** function
7. Look at the logs

#### 2. What to Look For

The logs will now show EXACTLY what's wrong:

**Scenario A: Wrong Connection String Format**
```
Connecting to MongoDB...
URI format check: mongodb://
⚠️ WARNING: Using mongodb:// instead of mongodb+srv://
⚠️ Please use mongodb+srv:// for MongoDB Atlas connections
❌ MongoDB connection error: ...
💡 TLS/SSL Error detected!
💡 Solution: Make sure your MONGODB_URI uses mongodb+srv://
```
→ **FIX**: Update `MONGODB_URI` in Vercel to use `mongodb+srv://`

**Scenario B: Correct Format (should work)**
```
Connecting to MongoDB...
URI format check: mongodb+srv://
✅ MongoDB connected successfully
```
→ **This means it's working!**

**Scenario C: Authentication Error**
```
Connecting to MongoDB...
URI format check: mongodb+srv://
❌ MongoDB connection error: Authentication failed
💡 Auth Error: Check your username and password
💡 URL-encode special characters in your password
```
→ **FIX**: Check username/password, URL-encode special chars

**Scenario D: Network Error**
```
Connecting to MongoDB...
URI format check: mongodb+srv://
❌ MongoDB connection error: getaddrinfo ENOTFOUND
💡 DNS Error: Check your cluster URL
```
→ **FIX**: Check cluster URL in connection string

#### 3. Quick Actions Based on What You See

### If you see `mongodb://` (NOT `mongodb+srv://`):

**Your MONGODB_URI is WRONG. Fix it:**

1. Get fresh connection string from MongoDB Atlas:
   - Go to https://cloud.mongodb.com
   - Click "Connect" on your cluster
   - Choose "Drivers" → "Node.js"
   - Copy the **SRV connection string**

2. It should look like:
   ```
   mongodb+srv://user:pass@cluster.mongodb.net/floxtime?retryWrites=true&w=majority
   ```

3. Update in Vercel:
   - Settings → Environment Variables
   - Edit `MONGODB_URI`
   - Paste the new value
   - Save

4. **Redeploy** (CRITICAL!):
   - Deployments → ⋮ → Redeploy

### If you see `mongodb+srv://` but still errors:

**Check the specific error message in the logs.**

**Common issues:**

1. **Authentication failed**:
   - Wrong username or password
   - Special characters in password not URL-encoded
   - User doesn't have the right permissions

2. **ENOTFOUND**:
   - Wrong cluster URL
   - Typo in connection string

3. **Network timeout**:
   - MongoDB Network Access doesn't have `0.0.0.0/0`

#### 4. Screenshot Your Logs

If still stuck, take a screenshot of the Function Logs showing:
- The "URI format check" line
- The error message
- Any 💡 diagnostic hints

---

## 🎯 Most Likely Issue

Based on the TLS error you were getting, your `MONGODB_URI` is probably:

**Wrong (current):**
```
mongodb://username:password@cluster.mongodb.net:27017/database
```

**Should be:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

Notice:
- `mongodb+srv://` NOT `mongodb://`
- No port number (`:27017`)
- Query parameters at the end

---

## 📸 What to Do Next

1. **Check the logs** (steps above)
2. **Find the line that says** `URI format check: ...`
3. **If it says** `mongodb://` → Your env var is wrong, update it
4. **If it says** `mongodb+srv://` → Look at the specific error message

**The logs will tell you EXACTLY what's wrong now!** 🔍

Check those logs and let me know what it says at the "URI format check" line!

