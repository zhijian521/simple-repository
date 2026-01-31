<script setup lang="ts">
const { uploadImages } = useImage()
const emit = defineEmits<{
  uploaded: []
}>()

const dragging = ref(false)
const uploading = ref(false)
const progress = ref(0)

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  dragging.value = false

  const files = Array.from(e.dataTransfer?.files || [])
    .filter(f => f.type.startsWith('image/'))

  if (files.length) {
    uploadFiles(files)
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  dragging.value = true
}

const handleDragLeave = () => {
  dragging.value = false
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])

  if (files.length) {
    uploadFiles(files)
  }

  // 清空 input，允许重复选择同一文件
  target.value = ''
}

const uploadFiles = async (files: File[]) => {
  if (files.length > 10) {
    alert('一次最多上传 10 张图片')
    return
  }

  uploading.value = true
  progress.value = 0

  try {
    // 模拟进度
    const progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += 10
      }
    }, 200)

    await uploadImages(files)

    clearInterval(progressInterval)
    progress.value = 100

    emit('uploaded')

    setTimeout(() => {
      uploading.value = false
      progress.value = 0
    }, 1000)
  } catch (e) {
    const error = e as Error
    alert('上传失败: ' + error.message)
    uploading.value = false
    progress.value = 0
  }
}

const triggerFileInput = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.onchange = handleFileSelect
  input.click()
}
</script>

<template>
  <div
    ref="uploadZone"
    class="upload-zone"
    :class="{ dragover: dragging, uploading }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="!uploading && triggerFileInput()"
  >
    <div class="upload-zone-icon">
      📤
    </div>
    <div class="upload-zone-text">
      {{ uploading ? '上传中...' : '拖拽图片到此处上传' }}
    </div>
    <div class="upload-zone-hint">
      支持 JPG、PNG、GIF、WebP 格式，最多一次上传 10 张
    </div>

    <div v-if="uploading" class="upload-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }" />
      </div>
      <div class="progress-info">
        <span>正在上传...</span>
        <span>{{ progress }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  border: 2px dashed var(--border-color, #d2d2d7);
  border-radius: var(--radius-md, 12px);
  padding: 48px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-tertiary, #f0f0f2);
  position: relative;
}

.upload-zone:hover:not(.uploading) {
  border-color: var(--accent-blue, #0071e3);
  background: rgba(0, 113, 227, 0.04);
}

.upload-zone.dragover {
  border-color: var(--accent-blue, #0071e3);
  background: rgba(0, 113, 227, 0.08);
}

.upload-zone.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.upload-zone-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  background: var(--bg-secondary, #ffffff);
  border-radius: var(--radius-md, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04));
}

.upload-zone-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-zone-hint {
  color: var(--text-secondary, #6e6e73);
  font-size: 0.875rem;
}

.upload-progress {
  margin-top: 24px;
}

.progress-bar {
  height: 4px;
  background: var(--bg-secondary, #ffffff);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-blue, #0071e3);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary, #6e6e73);
}
</style>
