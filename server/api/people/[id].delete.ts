import { connectToDatabase } from '../../utils/mongodb'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

function hashAccessCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
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

    const body = await readBody<{ accessCode: string }>(event)
    
    if (!body.accessCode) {
      throw createError({
        statusCode: 400,
        message: 'Phone number is required'
      })
    }

    const db = await connectToDatabase()
    const person = await db.collection('people').findOne({ _id: new ObjectId(id) })

    if (!person) {
      throw createError({
        statusCode: 404,
        message: 'Person not found'
      })
    }

    // Verify phone number
    const providedHash = hashAccessCode(body.accessCode)
    if (person.accessCodeHash !== providedHash) {
      throw createError({
        statusCode: 403,
        message: 'Invalid phone number'
      })
    }

    const result = await db.collection('people').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      throw createError({
        statusCode: 404,
        message: 'Person not found'
      })
    }

    return {
      success: true,
      message: 'Person deleted successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to delete person'
    })
  }
})
