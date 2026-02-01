import { message } from 'ant-design-vue'

export const useToast = () => {
  const show = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    message[type](msg)
  }

  const success = (msg: string) => {
    message.success(msg)
  }

  const error = (msg: string) => {
    message.error(msg)
  }

  const info = (msg: string) => {
    message.info(msg)
  }

  const warning = (msg: string) => {
    message.warning(msg)
  }

  return {
    show,
    success,
    error,
    info,
    warning,
  }
}
