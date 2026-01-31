import { verifyToken } from '~/server/utils/authHelpers'
import imageService from '~/server/services/image.service'
import { validateImageFiles, FILE_CONSTRAINTS } from '~/server/utils/fileValidation'
import { ERROR_MESSAGES } from '~/server/config/constants'

export default defineEventHandler(async (event) => {
  // 验证 Token
  await verifyToken(event)

  // Nuxt 内置处理 FormData
  const formData = await readFormData(event)
  const files = formData.getAll('images') as File[]

  if (!files || files.length === 0) {
    throw createError({
      statusCode: 400,
      message: ERROR_MESSAGES.NO_FILES,
    })
  }

  // 验证文件数量
  if (files.length > FILE_CONSTRAINTS.MAX_FILES_COUNT) {
    throw createError({
      statusCode: 400,
      message: ERROR_MESSAGES.TOO_MANY_FILES,
    })
  }

  // 验证所有文件
  const validation = await validateImageFiles(files)

  // 如果有无效文件，返回错误
  if (validation.invalid.length > 0) {
    throw createError({
      statusCode: 400,
      message: ERROR_MESSAGES.FILE_VALIDATION_FAILED,
      data: {
        errors: validation.invalid.map(v => ({
          filename: v.file.name,
          error: v.error,
        })),
      },
    })
  }

  // 上传有效文件
  const result = await imageService.uploadFiles(validation.valid)

  return {
    success: true,
    count: result.uploaded.length,
    uploaded: result.uploaded,
    errors: result.errors.length > 0 ? result.errors : undefined,
  }
})
