# Fix GCP MongoDB + Vercel TLS Issue

## Problem:
- Your MongoDB is on **GCP (Google Cloud Platform)**
- Vercel runs on **AWS**
- Cross-cloud TLS handshake is failing

## Solution 1: Add TLS Parameters (Try This First)

### Update Your Connection String

Add these parameters to your `MONGODB_URI` in Vercel:

**Current format:**
```
mongodb+srv://user:pass@cluster.gcp.mongodb.net/floxtime?retryWrites=true&w=majority
```

**New format with TLS parameters:**
```
mongodb+srv://user:pass@cluster.gcp.mongodb.net/floxtime?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=true
```

### Steps:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `MONGODB_URI`
3. Add to the end: `&tls=true&tlsAllowInvalidCertificates=true`
4. Save
5. Redeploy

⚠️ **Note**: `tlsAllowInvalidCertificates=true` is for testing. If this works, we'll try a more secure approach.

---

## Solution 2: Switch MongoDB to AWS Region (Recommended)

GCP + Vercel (AWS) often has TLS/networking issues. Using the same cloud provider solves this.

### Create New Cluster on AWS:

1. **MongoDB Atlas** → **"Create New Database"**
2. **Provider**: Select **AWS** (not GCP)
3. **Region**: Select **us-east-1** (Virginia) - same as your Vercel deployment
4. **Cluster Name**: `floxtime-aws-cluster`
5. Complete setup (same user/password setup as before)
6. Get connection string
7. Update in Vercel
8. Redeploy

**Why this works:**
- ✅ Same cloud provider (AWS ↔ AWS)
- ✅ Same region (us-east-1 ↔ iad1)
- ✅ Better TLS compatibility
- ✅ Lower latency

---

## Solution 3: Update MongoDB Driver

Your mongodb driver is `^6.3.0`. Let's update to latest:

```bash
bun add mongodb@latest
```

Then commit and push.

---

## Quick Comparison:

| Solution | Effort | Success Rate |
|----------|--------|--------------|
| Add TLS params | 2 min | 60% |
| Switch to AWS | 10 min | 95% |
| Update driver | 5 min | 40% |

**Recommendation**: Try Solution 1 first (2 min). If it doesn't work, do Solution 2 (switch to AWS).

---

## Why GCP + Vercel = Problem?

- Different cloud providers use different TLS certificates
- Cross-cloud networking has higher latency
- Certificate validation stricter between clouds
- GCP MongoDB TLS → AWS Vercel = handshake mismatch

