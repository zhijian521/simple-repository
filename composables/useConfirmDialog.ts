const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmCallback = ref<(() => void) | null>(null)
const confirmButtonText = ref('确认')

export const useConfirmDialog = () => {
  const confirm = (title: string, message: string, buttonText = '确认'): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmTitle.value = title
      confirmMessage.value = message
      confirmButtonText.value = buttonText
      confirmCallback.value = () => {
        showConfirm.value = false
        resolve(true)
      }
      showConfirm.value = true
    })
  }

  const close = () => {
    showConfirm.value = false
    confirmCallback.value = null
  }

  return {
    showConfirm,
    confirmTitle,
    confirmMessage,
    confirmButtonText,
    confirmCallback,
    confirm,
    close,
  }
}
