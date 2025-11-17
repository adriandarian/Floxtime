import { connectToDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    const people = await db.collection('people').find({}).toArray()
    
    return {
      success: true,
      data: people
    }
  } catch (error: any) {
    console.error('GET /api/people error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to fetch people',
      data: { error: error.message }
    })
  }
})
