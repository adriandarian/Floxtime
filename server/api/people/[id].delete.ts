import { connectToDatabase } from '../../utils/mongodb'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Person ID is required'
      })
    }

    const db = await connectToDatabase()
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
