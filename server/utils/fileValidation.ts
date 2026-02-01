import { FILE_CONSTRAINTS } from '~/server/config/constants'

/**
 * 图片文件魔数（文件头标识）
 */
const IMAGE_MAGIC_NUMBERS: Record<string, RegExp> = {
  'image/jpeg': /^\xff\xd8\xff/,
  'image/png': /^\x89\x50\x4e\x47/,
  'image/gif': /^GIF8[79]a/,
  'image/webp': /^RIFF....WEBP/,
  'image/svg+xml': /<svg/,
}

/**
 * 验证文件大小
 */
export function validateFileSize(file: File): boolean {
  return file.size <= FILE_CONSTRAINTS.MAX_FILE_SIZE
}

/**
 * 验证文件数量
 */
export function validateFilesCount(files: File[]): boolean {
  return files.length <= FILE_CONSTRAINTS.MAX_FILES_COUNT
}

/**
 * 验证文件 MIME 类型
 */
export function validateImageMimeType(file: File): boolean {
  return FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(file.type as typeof FILE_CONSTRAINTS.ALLOWED_IMAGE_TYPES[number])
}

/**
 * 通过读取文件头验证真实文件类型（防止 MIME 类型伪造）
 */
export async function validateImageFileType(file: File): Promise<boolean> {
  // SVG 文件特殊处理（文本文件）
  if (file.type === 'image/svg+xml') {
    const text = await file.text()
    const pattern = IMAGE_MAGIC_NUMBERS['image/svg+xml']
    return pattern ? pattern.test(text) : false
  }

  // 其他图片类型通过文件头验证
  const buffer = await file.slice(0, 12).arrayBuffer()
  const header = new Uint8Array(buffer)
  const headerString = Array.from(header)
    .map(b => String.fromCharCode(b))
    .join('')

  const magicNumber = IMAGE_MAGIC_NUMBERS[file.type]
  return magicNumber ? magicNumber.test(headerString) : false
}

/**
 * 完整的文件验证
 */
export async function validateImageFile(file: File): Promise<{
  valid: boolean
  error?: string
}> {
  // 1. 验证 MIME 类型
  if (!validateImageMimeType(file)) {
    return {
      valid: false,
      error: `不支持的文件类型: ${file.type}`,
    }
  }

  // 2. 验证文件大小
  if (!validateFileSize(file)) {
    return {
      valid: false,
      error: `文件过大: ${file.name} (最大 ${FILE_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB)`,
    }
  }

  // 3. 验证真实文件类型
  try {
    const isValidType = await validateImageFileType(file)
    if (!isValidType) {
      return {
        valid: false,
        error: `文件类型与扩展名不匹配: ${file.name}`,
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: `文件验证失败: ${file.name}`,
    }
  }

  return { valid: true }
}

/**
 * 批量验证文件
 */
export async function validateImageFiles(files: File[]): Promise<{
  valid: File[]
  invalid: Array<{ file: File; error: string }>
}> {
  const result = {
    valid: [] as File[],
    invalid: [] as Array<{ file: File; error: string }>,
  }

  for (const file of files) {
    const validation = await validateImageFile(file)
    if (validation.valid) {
      result.valid.push(file)
    } else {
      result.invalid.push({ file, error: validation.error! })
    }
  }

  return result
}
