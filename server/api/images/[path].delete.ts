import { verifyToken } from '~/server/utils/authHelpers'
import imageService from '~/server/services/image.service'
import { ERROR_MESSAGES } from '~/server/config/constants'

export default defineEventHandler(async (event) => {
  await verifyToken(event)

  const path = getRouterParam(event, 'path')
  const sha = getHeader(event, 'x-file-sha')

  if (!path || !sha) {
    throw createError({
      statusCode: 400,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
    })
  }

  await imageService.deleteImage(path, sha)

  return {
    success: true,
  }
})
