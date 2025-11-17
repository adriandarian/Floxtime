import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  // Return cached connection if available
  if (cachedDb && cachedClient) {
    try {
      // Test the connection
      await cachedClient.db().admin().ping()
      return cachedDb
    } catch (error) {
      console.log('Cached connection failed, reconnecting...')
      cachedClient = null
      cachedDb = null
    }
  }

  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri || uri === '') {
    console.error('MONGODB_URI is missing!')
    throw new Error('MONGODB_URI environment variable is not set. Please add it in Vercel Environment Variables.')
  }

  try {
    console.log('Connecting to MongoDB...')
    console.log('URI format check:', uri.substring(0, 14)) // Log first part to verify mongodb+srv
    
    // Validate connection string format
    if (!uri.startsWith('mongodb+srv://') && !uri.startsWith('mongodb://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://')
    }
    
    if (uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.warn('⚠️ WARNING: Using mongodb:// instead of mongodb+srv:// may cause TLS issues!')
      console.warn('⚠️ Please use mongodb+srv:// for MongoDB Atlas connections')
    }
    
    // Log connection attempt details (without password)
    const safeUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
    console.log('Attempting connection to:', safeUri)
    
    // Minimal config - let mongodb+srv:// handle TLS automatically
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      connectTimeoutMS: 10000,
    })
    
    console.log('Client created, connecting...')
    await client.connect()
    console.log('Client connected, verifying...')
    
    // Verify connection
    await client.db().admin().ping()
    console.log('✅ MongoDB connected successfully')
    
    const db = client.db()
    
    // Cache for reuse
    cachedClient = client
    cachedDb = db
    
    return db
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message)
    console.error('Error type:', error.name)
    console.error('Error code:', error.code)
    
    // Provide helpful error messages
    if (error.message.includes('tlsv1 alert') || error.message.includes('SSL')) {
      console.error('💡 TLS/SSL Error: MongoDB is REJECTING the connection')
      console.error('💡 This usually means:')
      console.error('   1. IP address not whitelisted (add 0.0.0.0/0 AND ::/0)')
      console.error('   2. Database user missing or wrong permissions')
      console.error('   3. Cluster still provisioning (wait 5 min)')
      console.error('💡 See MONGODB_AWS_TROUBLESHOOTING.md for step-by-step fix')
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 DNS Error: Check your cluster URL in the connection string')
      console.error('💡 Get a fresh connection string from MongoDB Atlas')
    }
    
    if (error.message.includes('Authentication failed')) {
      console.error('💡 Auth Error: Check your username and password')
      console.error('💡 URL-encode special characters in your password')
      console.error('💡 Verify user exists in Database Access')
    }
    
    if (error.message.includes('Server selection timed out')) {
      console.error('💡 Timeout Error: Cannot reach MongoDB cluster')
      console.error('💡 Check Network Access whitelist (0.0.0.0/0)')
      console.error('💡 Verify cluster is active (not paused)')
    }
    
    throw new Error(`Failed to connect to MongoDB: ${error.message}`)
  }
}

export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}
