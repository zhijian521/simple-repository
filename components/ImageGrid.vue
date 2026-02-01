<script setup lang="ts">
import type { ImageInfo } from '~/types'
const { images, loading, fetchImages, deleteImage } = useImage()
const { isLoggedIn } = useAuth()
const { confirm } = useConfirmDialog()
const { error } = useToast()
const selectedImage = ref<ImageInfo | null>(null)
const hasLoaded = ref(false)
const activeMenuSha = ref<string | null>(null)

watch(isLoggedIn, (loggedIn) => {
  if (loggedIn && !hasLoaded.value) {
    fetchImages()
    hasLoaded.value = true
  }
}, { immediate: true })

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const getThumbnailUrl = (url: string): string => {
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&q=80`
}

const toggleMenu = (sha: string, event: Event) => {
  event.stopPropagation()
  activeMenuSha.value = activeMenuSha.value === sha ? null : sha
}

const closeMenu = () => {
  activeMenuSha.value = null
}

const handleDelete = async (image: ImageInfo) => {
  const confirmed = await confirm('确认删除', `确定要删除图片 "${image.name}" 吗？`, '确认删除')
  if (!confirmed) return

  try {
    await deleteImage(image)
  } catch (e) {
    error('删除失败: ' + (e as Error).message)
  }
  closeMenu()
}

const handleImageClick = (img: ImageInfo) => {
  if (!activeMenuSha.value) {
    selectedImage.value = img
  }
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.context-menu') && !target.closest('.more-btn')) {
      closeMenu()
    }
  })
})

</script>

<template>
  <div class="gallery-section">
    <div class="gallery-toolbar">
      <h2 class="gallery-title">
        全部图片
        <span class="gallery-count">({{ images.length }})</span>
      </h2>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-grid">
      <div v-for="i in 8" :key="i" class="skeleton" />
    </div>

    <!-- 空状态 -->
    <div v-else-if="images.length === 0" class="empty-state">
      <div class="empty-state-icon">
        🖼️
      </div>
      <h3>还没有图片</h3>
      <p>拖拽或点击上传区域添加图片</p>
    </div>

    <!-- 图片网格 -->
    <div v-else class="image-grid">
      <div
        v-for="img in images"
        :key="img.sha"
        class="image-item"
        @click="handleImageClick(img)"
      >
        <img
          :src="getThumbnailUrl(img.url)"
          :alt="img.name"
          loading="lazy"
        >
        <div class="image-meta">
          <div class="image-name">{{ img.name }}</div>
          <div class="image-size">{{ formatSize(img.size) }}</div>
        </div>

        <button class="more-btn" @click="toggleMenu(img.sha, $event)">
          •••
        </button>

        <div v-if="activeMenuSha === img.sha" class="context-menu" @click.stop>
          <div class="menu-item" @click="selectedImage = img; closeMenu()">
            查看大图
          </div>
          <div class="menu-item danger" @click="handleDelete(img)">
            删除图片
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <ImageModal v-if="selectedImage" :image="selectedImage" @close="selectedImage = null" />
  </div>
</template>

<style scoped>
.gallery-section {
  background: var(--bg-secondary, #ffffff);
  border-radius: var(--radius-lg, 18px);
  padding: 24px;
  border: 1px solid var(--border-color, #d2d2d7);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04));
}

.gallery-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color, #d2d2d7);
}

.gallery-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.gallery-count {
  color: var(--text-secondary, #6e6e73);
  font-size: 0.875rem;
  font-weight: 400;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  position: relative;
  background: var(--bg-tertiary, #f0f0f2);
  border-radius: var(--radius-md, 12px);
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 1;
  border: 1px solid var(--border-color, #d2d2d7);
  transition: all 0.2s;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 4px 16px rgba(0, 0, 0, 0.08));
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-meta {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-meta {
  opacity: 1;
}

.image-name {
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-size {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  margin-top: 2px;
}

.more-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.image-item:hover .more-btn {
  opacity: 1;
}

.more-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.context-menu {
  position: absolute;
  top: 44px;
  right: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 6px;
  min-width: 140px;
  z-index: 100;
}

.menu-item {
  padding: 10px 14px;
  font-size: 0.9rem;
  color: var(--text-primary, #1d1d1f);
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}

.menu-item:hover {
  background: var(--bg-tertiary, #f0f0f2);
}

.menu-item.danger {
  color: var(--accent-red, #ff3b30);
}

.menu-item.danger:hover {
  background: rgba(255, 59, 48, 0.1);
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.skeleton {
  aspect-ratio: 1;
  border-radius: var(--radius-md, 12px);
  background: var(--bg-tertiary, #f0f0f2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  background: var(--bg-tertiary, #f0f0f2);
  border-radius: var(--radius-lg, 18px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 36px;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary, #6e6e73);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .image-grid,
  .loading-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
