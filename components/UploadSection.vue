<script setup lang="ts">
import { InboxOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  upload: [files: File[]]
}>()

const { error: showError } = useToast()

const beforeUpload = (file: File) => {
  if (!file.type.startsWith('image/')) {
    showError('只能上传图片文件')
    return false
  }
  return true
}

const customRequest = async ({ file, onSuccess, onError }: any) => {
  try {
    emit('upload', [file])
    onSuccess?.()
  } catch (e: any) {
    onError?.(e)
  }
}
</script>

<template>
  <a-card class="upload-card" :bordered="false">
    <a-upload-dragger
      name="file"
      :multiple="true"
      :custom-request="customRequest"
      :before-upload="beforeUpload"
      :show-upload-list="false"
      accept="image/*"
    >
      <div class="upload-content">
        <p class="upload-icon">
          <InboxOutlined />
        </p>
        <p class="upload-text">
          点击或拖拽图片到此区域上传
        </p>
        <p class="upload-hint">
          支持 JPG、PNG、GIF、WebP 格式，单次最多上传 10 张图片
        </p>
      </div>
    </a-upload-dragger>
  </a-card>
</template>

<style scoped>
.upload-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02);
}

.upload-content {
  padding: 32px;
}

.upload-icon {
  font-size: 48px;
  color: #1677ff;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}
</style>
