// Confirm Dialog State
interface ConfirmState {
  show: boolean
  title: string
  message: string
  confirmText: string
  type: 'confirm' | 'danger'
}

const state = reactive<ConfirmState>({
  show: false,
  title: '',
  message: '',
  confirmText: '确认',
  type: 'confirm',
})

let resolveFn: ((value: boolean) => void) | null = null

export const useConfirmDialog = () => {
  // 显示确认对话框
  const showConfirm = (
    title: string,
    message: string,
    confirmText = '确认',
    type: 'confirm' | 'danger' = 'confirm'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      state.title = title
      state.message = message
      state.confirmText = confirmText
      state.type = type
      state.show = true
      resolveFn = resolve
    })
  }

  // 取消
  const cancel = () => {
    state.show = false
    resolveFn?.(false)
    resolveFn = null
  }

  // 确认
  const doConfirm = () => {
    state.show = false
    resolveFn?.(true)
    resolveFn = null
  }

  return {
    confirmState: readonly(state),
    confirm: showConfirm,
    cancel,
    onConfirm: doConfirm,
  }
}
