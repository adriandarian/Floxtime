import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }

  db = client.db()
  return db
}

export async function closeDatabaseConnection() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
