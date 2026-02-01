const toast = ref<{
  show: boolean
  message: string
  type: 'success' | 'error'
}>({
  show: false,
  message: '',
  type: 'success'
})

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useToast = () => {
  const show = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = {
      show: true,
      message,
      type
    }

    if (toastTimer) {
      clearTimeout(toastTimer)
    }

    toastTimer = setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }

  const success = (message: string) => {
    show(message, 'success')
  }

  const error = (message: string) => {
    show(message, 'error')
  }

  return {
    toast,
    show,
    success,
    error,
  }
}
