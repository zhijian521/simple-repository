<script setup lang="ts">
const { login, isLoggedIn } = useAuth()
const show = computed(() => !isLoggedIn.value)
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await login(username.value, password.value)
    username.value = ''
    password.value = ''
  } catch (e: any) {
    errorMessage.value = e.message || '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="login-modal">
        <div class="login-card">
          <div class="login-header">
            <h2>🔐 登录</h2>
            <p>请输入您的凭据以访问资源仓库</p>
          </div>

          <div v-if="errorMessage" class="login-error">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="username">用户名</label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                autocomplete="username"
                placeholder="请输入用户名"
              >
            </div>

            <div class="form-group">
              <label for="password">密码</label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="请输入密码"
              >
            </div>

            <button type="submit" class="login-btn" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.login-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  background: var(--bg-secondary, #ffffff);
  border-radius: var(--radius-lg, 18px);
  padding: 40px;
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  color: var(--text-secondary, #6e6e73);
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color, #d2d2d7);
  border-radius: var(--radius-sm, 8px);
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-blue, #0071e3);
  box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: var(--accent-blue, #0071e3);
  color: white;
  border: none;
  border-radius: var(--radius-sm, 8px);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.login-btn:hover {
  background: var(--accent-blue-hover, #0077ed);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-error {
  background: rgba(255, 59, 48, 0.1);
  color: var(--accent-red, #ff3b30);
  padding: 12px;
  border-radius: var(--radius-sm, 8px);
  margin-bottom: 20px;
  font-size: 0.9rem;
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
