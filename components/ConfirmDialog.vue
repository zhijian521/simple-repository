<script setup lang="ts">
const { showConfirm, confirmTitle, confirmMessage, confirmButtonText, confirmCallback, close } = useConfirmDialog()

const handleConfirm = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showConfirm" class="confirm-overlay" @click.self="close">
        <div class="confirm-dialog">
          <div class="confirm-header">
            <div class="confirm-icon">⚠️</div>
            <h3 class="confirm-title">{{ confirmTitle }}</h3>
          </div>

          <p class="confirm-message">{{ confirmMessage }}</p>

          <div class="confirm-actions">
            <button class="btn btn-cancel" @click="close">
              取消
            </button>
            <button class="btn btn-danger" @click="handleConfirm">
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-dialog {
  background: var(--bg-secondary, #ffffff);
  border-radius: var(--radius-lg, 18px);
  padding: 32px;
  width: 90%;
  max-width: 420px;
  box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-header {
  text-align: center;
  margin-bottom: 20px;
}

.confirm-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.confirm-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary, #1d1d1f);
  margin: 0;
}

.confirm-message {
  text-align: center;
  color: var(--text-secondary, #6e6e73);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: var(--radius-sm, 8px);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-tertiary, #f0f0f2);
  color: var(--text-primary, #1d1d1f);
}

.btn-cancel:hover {
  background: var(--border-color, #d2d2d7);
}

.btn-danger {
  background: var(--accent-red, #ff3b30);
  color: white;
}

.btn-danger:hover {
  background: #ff1f13;
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
