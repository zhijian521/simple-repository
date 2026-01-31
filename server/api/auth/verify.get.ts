import { verifyToken } from '~/server/utils/authHelpers'

export default defineEventHandler(async (event) => {
  try {
    const decoded = await verifyToken(event)
    return {
      success: true,
      user: {
        username: decoded.username,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: '未登录',
    }
  }
})
