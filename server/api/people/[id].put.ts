import { connectToDatabase } from '../../utils/mongodb'
import { ObjectId } from 'mongodb'

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
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Person ID is required'
      })
    }

    const body = await readBody<Person>(event)
    
    if (!body.name || !body.dateRanges || !Array.isArray(body.dateRanges)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body. Name and dateRanges array are required.'
      })
    }

    const db = await connectToDatabase()
    const result = await db.collection('people').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: body.name,
          dateRanges: body.dateRanges,
          updatedAt: new Date()
        }
      }
    )

    if (result.matchedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'Person not found'
      })
    }

    return {
      success: true,
      data: {
        _id: id,
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
      message: error.message || 'Failed to update person'
    })
  }
})
