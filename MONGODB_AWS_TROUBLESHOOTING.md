# MongoDB AWS Connection Troubleshooting

## ❌ Error: TLS alert internal error (alert 80)

This means **MongoDB Atlas is rejecting the connection** during TLS handshake.

---

## ✅ Step-by-Step Fix

### 1. **Verify MongoDB Cluster Status**
- Go to [MongoDB Atlas](https://cloud.mongodb.com)
- Check your cluster shows **green "Active"** status
- If it says "Provisioning", wait 5-10 minutes

### 2. **Network Access (CRITICAL)**
- MongoDB Atlas → Security → Network Access
- Click **"Add IP Address"**
- Select **"Allow Access from Anywhere"**
- Enter: `0.0.0.0/0`
- **IMPORTANT**: Also add `::/0` for IPv6
- Click **"Confirm"**
- Wait 1-2 minutes for changes to propagate

### 3. **Database User Permissions**
- MongoDB Atlas → Security → Database Access
- Find your user: `adrianthehactus_db_user`
- **Role must be**: `Atlas admin` or `readWriteAnyDatabase`
- If not, click "Edit" → Change role → Save

### 4. **Get Fresh Connection String**
- MongoDB Atlas → Databases → Connect
- Choose: **"Connect your application"**
- Driver: **Node.js**
- Version: **5.5 or later**
- Connection string format:
  ```
  mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
  ```
- **DO NOT add any extra TLS parameters**
- Copy the EXACT string

### 5. **Update Vercel Environment Variable**
- Vercel Dashboard → Project Settings → Environment Variables
- Find `MONGODB_URI`
- Click "Edit"
- Paste the NEW connection string from step 4
- Replace `<password>` with your actual password
- Replace `<database>` with `floxtime`
- Example:
  ```
  mongodb+srv://adrianthehactus_db_user:q5YXx5blfV96jevJ@floxtime-aws.xxxxx.mongodb.net/floxtime?retryWrites=true&w=majority
  ```
- **Save**
- ⚠️ Make sure it's set for **Production** environment

### 6. **Redeploy on Vercel**
- Go to Vercel Dashboard → Deployments
- Click "..." on latest deployment → "Redeploy"
- OR push a new commit to trigger deployment

---

## 🧪 Test Connection Locally First

Before deploying, test locally:

1. Create `.env` file:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/floxtime?retryWrites=true&w=majority
```

2. Run:
```bash
npm run dev
```

3. Open browser: `http://localhost:3000`
4. Check console - should see: ✅ MongoDB connected successfully

If local works but Vercel doesn't → Environment variable issue

---

## 🔍 Still Not Working?

### Check Vercel Logs for Exact Error:
```bash
vercel logs --follow
```

### Common Issues:

**"ENOTFOUND"** → Wrong cluster URL
- Get a fresh connection string from Atlas

**"Authentication failed"** → Wrong password or username
- Check Database Access in Atlas
- Try resetting password
- URL-encode special characters in password

**"tlsv1 alert"** (alert 80) → IP not whitelisted
- Double-check Network Access has `0.0.0.0/0`
- Also add `::/0` for IPv6
- Wait 2-3 minutes after adding

**"ECONNREFUSED"** → Cluster not active
- Check cluster status in Atlas
- Wait for it to turn green

---

## 📋 Checklist

Before asking for help, verify:
- [ ] Cluster status is **green/active**
- [ ] Network Access has `0.0.0.0/0` **AND** `::/0`
- [ ] User has **readWriteAnyDatabase** role
- [ ] Connection string uses `mongodb+srv://`
- [ ] Connection string has NO extra TLS parameters
- [ ] Password is URL-encoded (no special chars)
- [ ] Vercel environment variable is updated
- [ ] Redeployed after changing env var
- [ ] Waited 2-3 minutes after Network Access changes
- [ ] Connection works locally

---

## 🎯 Expected Working Connection String

```
mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/floxtime?retryWrites=true&w=majority
```

**NO:**
- ❌ `&tls=true`
- ❌ `&tlsAllowInvalidCertificates=true`
- ❌ `&tlsInsecure=true`
- ❌ Any other TLS parameters

**The `mongodb+srv://` format handles ALL TLS configuration automatically!**

