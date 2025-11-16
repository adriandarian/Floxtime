import { connectToDatabase } from '../../utils/mongodb'

interface DateRange {
  start: string
  end: string
}

interface Person {
  name: string
  dateRanges: DateRange[]
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<Person>(event)
    
    if (!body.name || !body.dateRanges || !Array.isArray(body.dateRanges)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body. Name and dateRanges array are required.'
      })
    }

    const db = await connectToDatabase()
    const result = await db.collection('people').insertOne({
      name: body.name,
      dateRanges: body.dateRanges,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return {
      success: true,
      data: {
        _id: result.insertedId,
        name: body.name,
        dateRanges: body.dateRanges
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create person'
    })
  }
})
