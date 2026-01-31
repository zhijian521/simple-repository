import { verifyToken } from '~/server/utils/authHelpers'
import imageService from '~/server/services/image.service'

export default defineEventHandler(async (event) => {
  // 验证 Token
  await verifyToken(event)

  const images = await imageService.getImages()

  return {
    success: true,
    count: images.length,
    images,
  }
})
