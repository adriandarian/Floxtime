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
    
    // Create new client with serverless-friendly options and TLS config
    const client = new MongoClient(uri, {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 60000,
      
      // Timeout settings
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // TLS/SSL settings for Vercel serverless
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Compression
      compressors: ['snappy', 'zlib'],
    })
    
    await client.connect()
    console.log('MongoDB connected successfully')
    
    const db = client.db()
    
    // Cache for reuse
    cachedClient = client
    cachedDb = db
    
    return db
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message)
    console.error('Full error:', error)
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
