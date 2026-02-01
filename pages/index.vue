<script setup lang="ts">
import {
  PictureOutlined, SettingOutlined, BellOutlined, QuestionCircleOutlined,
  UserOutlined, ReloadOutlined, LogoutOutlined, HomeOutlined,
  FolderOutlined, DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
} from '@ant-design/icons-vue'

const { logout, isLoggedIn } = useAuth()
const { confirm } = useConfirmDialog()
const {
  images, loading, uploading, previewVisible, previewImage,
  formatSize, fetchImages, handleUpload, handleDelete, openPreview, closePreview,
} = useImageManager()

const collapsed = ref(false)
const selectedKeys = ref(['images'])
const openKeys = ref(['resources'])

onMounted(() => {
  if (isLoggedIn.value) fetchImages()
})

const handleDeleteImage = async (image: any) => {
  if (await confirm('确认删除', `确定要删除 "${image.name}" 吗？`, '确认删除')) {
    await handleDelete(image)
  }
}
</script>

<template>
  <a-layout class="layout">
    <!-- 浅色侧边栏 -->
    <a-layout-sider 
      v-model:collapsed="collapsed" 
      :trigger="null" 
      collapsible 
      width="256"
      theme="light"
      class="sider"
    >
      <div class="logo">
        <img src="/icon.png" alt="logo" class="logo-img">
        <span v-if="!collapsed" class="logo-text">simple-repository</span>
      </div>
      <a-menu 
        v-model:selectedKeys="selectedKeys" 
        v-model:openKeys="openKeys" 
        mode="inline"
        class="menu"
      >
        <a-menu-item key="home">
          <template #icon><HomeOutlined /></template>
          首页
        </a-menu-item>
        <a-sub-menu key="resources">
          <template #icon><FolderOutlined /></template>
          <template #title>资源管理</template>
          <a-menu-item key="images">
            <template #icon><PictureOutlined /></template>
            图片管理
          </a-menu-item>
        </a-sub-menu>
        <a-menu-item key="settings">
          <template #icon><SettingOutlined /></template>
          系统设置
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <a-button type="text" @click="collapsed = !collapsed">
            <component :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined" />
          </a-button>
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item><HomeOutlined /></a-breadcrumb-item>
            <a-breadcrumb-item>资源管理</a-breadcrumb-item>
            <a-breadcrumb-item>图片管理</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <a-space>
            <a-button type="text" shape="circle"><BellOutlined /></a-button>
            <a-button type="text" shape="circle"><QuestionCircleOutlined /></a-button>
            <a-dropdown>
              <a-space class="user-info">
                <a-avatar :size="28"><UserOutlined /></a-avatar>
                <span class="username">管理员</span>
                <DownOutlined class="dropdown-arrow" />
              </a-space>
              <template #overlay>
                <a-menu class="user-menu">
                  <a-menu-item @click="logout">
                    <template #icon><LogoutOutlined /></template>
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>

      <a-layout-content class="content">
        <div class="page-header">
          <h1 class="page-title">图片管理</h1>
          <p class="page-desc">上传图片并自动同步到 GitHub 仓库</p>
        </div>

        <UploadSection :loading="uploading" @upload="handleUpload" />

        <a-card :bordered="false" :title="`全部图片 (${images.length})`">
          <template #extra>
            <a-button type="primary" :loading="loading" @click="fetchImages">
              <ReloadOutlined />刷新
            </a-button>
          </template>
          <ImageGallery :images="images" :loading="loading" @preview="openPreview" @delete="handleDeleteImage" />
        </a-card>
      </a-layout-content>
    </a-layout>
  </a-layout>

  <LoginModal />
  
  <a-modal v-model:visible="previewVisible" :title="previewImage?.name" :footer="null" width="auto" centered>
    <div class="preview">
      <img v-if="previewImage" :src="previewImage.url">
      <div v-if="previewImage" class="preview-meta">
        <span>{{ formatSize(previewImage.size) }}</span>
        <span>{{ new Date(previewImage.uploadedAt).toLocaleString('zh-CN') }}</span>
      </div>
    </div>
  </a-modal>

  <ConfirmDialog />
  <Toast />
</template>

<style scoped>
.layout { 
  height: 100vh;
  overflow: hidden;
}

/* 浅色侧边栏样式 - 固定不滚动 */
.sider {
  background: #fff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
  height: 100vh;
  overflow: hidden;
}

.sider :deep(.ant-layout-sider-children) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sider :deep(.ant-menu) {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sider :deep(.ant-layout-sider-children) {
  background: #fff;
}

.logo { 
  height: 64px; 
  display: flex; 
  align-items: center; 
  padding: 0 20px; 
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.logo-img { 
  width: 32px; 
  height: 32px; 
  border-radius: 6px;
  object-fit: contain;
}

.logo-text { 
  font-size: 18px; 
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

/* 浅色菜单样式 */
.menu {
  border-right: none;
  padding: 8px 12px;
}

.sider :deep(.ant-menu-item) {
  border-radius: 6px;
  margin: 4px 0;
  height: 40px;
  line-height: 40px;
}

.sider :deep(.ant-menu-item-selected) {
  background: #e6f4ff !important;
  color: #1677ff;
  font-weight: 500;
}

.sider :deep(.ant-menu-submenu-title) {
  border-radius: 6px;
  margin: 4px 0;
  height: 40px;
  line-height: 40px;
}

.sider :deep(.ant-menu-inline.ant-menu-sub) {
  background: transparent;
}

/* Header */
.header { 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 0 24px; 
  background: #fff; 
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
}

.breadcrumb { 
  margin-left: 8px; 
}

.user-info { 
  cursor: pointer; 
  padding: 6px 12px; 
  border-radius: 4px; 
  align-items: center;
}

.user-info:hover { 
  background: rgba(0, 0, 0, 0.025); 
}

.username { 
  font-size: 14px; 
  color: rgba(0, 0, 0, 0.65);
  margin-left: 8px;
}

.dropdown-arrow {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-left: 4px;
}

/* Header 下拉菜单样式 - 与侧边栏保持一致 */
.user-menu :deep(.ant-menu-item) {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  padding: 0 16px;
  gap: 10px;
}

.user-menu :deep(.ant-menu-item .anticon) {
  font-size: 14px;
}

/* 右侧内容区域 - 可滚动 */
.content { 
  margin: 24px; 
  overflow-y: auto;
  height: calc(100vh - 64px);
}

.page-header { 
  margin-bottom: 24px; 
}

.page-title { 
  font-size: 24px; 
  font-weight: 600; 
  margin-bottom: 8px; 
}

.page-desc { 
  font-size: 14px; 
  color: rgba(0, 0, 0, 0.45); 
}

/* Preview */
.preview { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
}

.preview img { 
  max-width: 80vw; 
  max-height: 70vh; 
  object-fit: contain; 
  border-radius: 8px; 
}

.preview-meta { 
  margin-top: 16px; 
  display: flex; 
  gap: 24px; 
  font-size: 14px; 
  color: rgba(0, 0, 0, 0.45); 
}

@media (max-width: 768px) {
  .username { display: none; }
  .content { margin: 16px; }
}
</style>
