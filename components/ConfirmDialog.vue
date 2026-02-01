<script setup lang="ts">
import { ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'

const { confirmState, cancel, onConfirm } = useConfirmDialog()
</script>

<template>
  <a-modal
    :visible="confirmState.show"
    :title="confirmState.title"
    :closable="false"
    :mask-closable="false"
    width="420px"
    centered
    @ok="onConfirm"
    @cancel="cancel"
  >
    <div class="confirm-content">
      <div class="confirm-icon">
        <QuestionCircleOutlined v-if="confirmState.type === 'confirm'" />
        <ExclamationCircleOutlined v-else />
      </div>
      <div class="confirm-message">{{ confirmState.message }}</div>
    </div>
    
    <template #footer>
      <a-space>
        <a-button @click="cancel">
          取消
        </a-button>
        <a-button 
          :type="confirmState.type === 'danger' ? 'danger' : 'primary'"
          @click="onConfirm"
        >
          {{ confirmState.confirmText }}
        </a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<style scoped>
.confirm-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
}

.confirm-icon {
  font-size: 24px;
  color: #faad14;
  flex-shrink: 0;
}

.confirm-message {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5;
}
</style>
