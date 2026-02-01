<script setup lang="ts">
import { LockOutlined, UserOutlined, SafetyOutlined } from '@ant-design/icons-vue'

const { login, isLoggedIn } = useAuth()
const show = computed(() => !isLoggedIn.value)

const username = ref('')
const password = ref('')
const loading = ref(false)
const formRef = ref()

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    
    loading.value = true
    await login(username.value, password.value)
    
    // 清空表单
    username.value = ''
    password.value = ''
  } catch (e: any) {
    // 表单验证失败或登录失败
    if (e.message) {
      // 显示错误提示已在 useAuth 中处理
    }
  } finally {
    loading.value = false
  }
}

// 按回车登录
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <a-modal
    :visible="show"
    :closable="false"
    :mask-closable="false"
    :footer="null"
    width="420px"
    centered
    class="login-modal"
  >
    <div class="login-container">
      <!-- Logo -->
      <div class="login-header">
        <div class="login-logo">
          <SafetyOutlined />
        </div>
        <h2 class="login-title">资源仓库</h2>
        <p class="login-subtitle">请输入您的凭据以访问系统</p>
      </div>

      <!-- 登录表单 -->
      <a-form
        ref="formRef"
        :model="{ username, password }"
        :rules="rules"
        layout="vertical"
        @finish="handleLogin"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="username"
            size="large"
            placeholder="用户名"
            @keydown="handleKeydown"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="password">
          <a-input-password
            v-model:value="password"
            size="large"
            placeholder="密码"
            @keydown="handleKeydown"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <a-button
          type="primary"
          size="large"
          block
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </a-button>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped>
.login-modal :deep(.ant-modal-content) {
  border-radius: 12px;
  overflow: hidden;
}

.login-container {
  padding: 24px 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 32px;
  color: white;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

:deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}

:deep(.ant-btn) {
  border-radius: 8px;
}
</style>
