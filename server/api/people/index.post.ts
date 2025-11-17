import { connectToDatabase } from '../../utils/mongodb'
import crypto from 'crypto'

interface DateRange {
  start: string
  end: string
}

interface Person {
  name: string
  dateRanges: DateRange[]
  accessCode: string
}

function hashAccessCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<Person>(event)
    
    if (!body.name || !body.dateRanges || !Array.isArray(body.dateRanges) || !body.accessCode) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request body. Name, dateRanges array, and accessCode are required.'
      })
    }

    if (body.accessCode.length < 10) {
      throw createError({
        statusCode: 400,
        message: 'Phone number must be at least 10 digits long.'
      })
    }

    const db = await connectToDatabase()
    const result = await db.collection('people').insertOne({
      name: body.name,
      dateRanges: body.dateRanges,
      accessCodeHash: hashAccessCode(body.accessCode),
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
