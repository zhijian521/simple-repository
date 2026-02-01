<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core'
import type { ImageInfo } from '~/types'

const props = defineProps<{
  image: ImageInfo
}>()

const emit = defineEmits<{
  close: []
}>()

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

onKeyStroke('Escape', () => {
  emit('close')
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal" @click.self="emit('close')">
        <div class="modal-content">
          <button class="modal-close" @click="emit('close')">
            ✕
          </button>

          <img :src="image.url" :alt="image.name" class="modal-image">

          <div class="modal-info">
            <div class="modal-title">{{ image.name }}</div>
            <div class="modal-meta">
              <span>{{ formatSize(image.size) }}</span>
              <span>{{ formatDate(image.uploadedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-close {
  position: absolute;
  top: -50px;
  right: 0;
  color: white;
  font-size: 32px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
}

.modal-close:hover {
  opacity: 1;
}

.modal-image {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: var(--radius-md, 12px);
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
  display: block;
}

.modal-info {
  margin-top: 16px;
  text-align: center;
  color: white;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.modal-meta {
  display: flex;
  gap: 16px;
  justify-content: center;
  font-size: 0.9rem;
  opacity: 0.7;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
