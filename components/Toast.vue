<script setup lang="ts">
const { toast } = useToast()
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: var(--radius-sm, 8px);
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 4000;
  min-width: 300px;
}

.toast.success {
  background: var(--bg-secondary, #ffffff);
  color: var(--text-primary, #1d1d1f);
  border: 1px solid #34c759;
}

.toast.error {
  background: var(--bg-secondary, #ffffff);
  color: var(--text-primary, #1d1d1f);
  border: 1px solid var(--accent-red, #ff3b30);
}

.toast-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast.success .toast-icon {
  background: #34c759;
  color: white;
}

.toast.error .toast-icon {
  background: var(--accent-red, #ff3b30);
  color: white;
}

.toast-message {
  font-size: 0.95rem;
  font-weight: 500;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
