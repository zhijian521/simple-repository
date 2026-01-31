<script setup lang="ts">
const { logout } = useAuth()
const { fetchImages } = useImage()

const handleUploadComplete = () => {
  fetchImages()
}

const handleLogout = () => {
  logout()
}
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">
            📦
          </div>
          <span>资源仓库</span>
        </div>
        <div class="nav-actions">
          <button class="btn btn-secondary" @click="fetchImages">
            ↻ 刷新
          </button>
          <button class="btn btn-secondary" @click="handleLogout">
            退出登录
          </button>
        </div>
      </div>
    </header>

    <main class="container">
      <div class="page-header">
        <h1 class="page-title">图片管理</h1>
        <p class="page-subtitle">上传图片并自动同步到 GitHub 仓库</p>
      </div>

      <section class="upload-section">
        <UploadZone @uploaded="handleUploadComplete" />
      </section>

      <ImageGrid />
    </main>

    <LoginModal />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: var(--bg-primary, #f5f5f7);
}

.header {
  background: var(--bg-secondary, #ffffff);
  border-bottom: 1px solid var(--border-color, #d2d2d7);
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.25rem;
  font-weight: 600;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--accent-blue, #0071e3);
  border-radius: var(--radius-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm, 8px);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: var(--accent-blue, #0071e3);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-blue-hover, #0077ed);
}

.btn-secondary {
  background: var(--bg-tertiary, #f0f0f2);
  color: var(--text-primary, #1d1d1f);
}

.btn-secondary:hover {
  background: var(--border-color, #d2d2d7);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.page-subtitle {
  color: var(--text-secondary, #6e6e73);
  font-size: 0.95rem;
}

.upload-section {
  background: var(--bg-secondary, #ffffff);
  border-radius: var(--radius-lg, 18px);
  padding: 48px;
  margin-bottom: 32px;
  border: 1px solid var(--border-color, #d2d2d7);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.04));
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .upload-section {
    padding: 24px;
  }
}
</style>
