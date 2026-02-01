<script setup lang="ts">
import { EyeOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons-vue'
import type { ImageInfo } from '~/types'

const props = defineProps<{
  images: ImageInfo[]
  loading: boolean
}>()

const emit = defineEmits<{
  preview: [image: ImageInfo]
  delete: [image: ImageInfo]
}>()

const { formatSize, getThumbnailUrl } = useImageManager()
</script>

<template>
  <!-- 加载状态 -->
  <div v-if="loading" class="loading-grid">
    <a-skeleton
      v-for="i in 8"
      :key="i"
      active
      :paragraph="false"
      :avatar="{ size: 'large', shape: 'square' }"
    />
  </div>

  <!-- 空状态 -->
  <a-empty v-else-if="images.length === 0" description="还没有图片">
    <template #image>
      <PictureOutlined style="font-size: 64px; color: #d9d9d9;" />
    </template>
    <p style="color: #999; margin-top: 8px;">
      拖拽或点击上传区域添加图片
    </p>
  </a-empty>

  <!-- 图片网格 -->
  <div v-else class="image-grid">
    <div
      v-for="img in images"
      :key="img.sha"
      class="image-item"
    >
      <div class="image-wrapper">
        <img
          :src="getThumbnailUrl(img.url)"
          :alt="img.name"
          loading="lazy"
          @click="emit('preview', img)"
        >
        <div class="image-overlay">
          <a-space>
            <a-button
              type="primary"
              shape="circle"
              size="small"
              @click.stop="emit('preview', img)"
            >
              <EyeOutlined />
            </a-button>
            <a-button
              danger
              shape="circle"
              size="small"
              @click.stop="emit('delete', img)"
            >
              <DeleteOutlined />
            </a-button>
          </a-space>
        </div>
      </div>
      <div class="image-info">
        <div class="image-name" :title="img.name">{{ img.name }}</div>
        <div class="image-size">{{ formatSize(img.size) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.image-item {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.image-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
  cursor: pointer;
}

.image-wrapper:hover img {
  transform: scale(1.05);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.image-info {
  padding: 12px;
}

.image-name {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.image-size {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

@media (max-width: 768px) {
  .image-grid,
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
