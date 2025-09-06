import { ref } from 'vue'

interface DialogOptions {
  title?: string
  message: string
  showCancel?: boolean
  confirmText?: string
  cancelText?: string
}

export const useDialog = () => {
  const isVisible = ref(false)
  const title = ref('')
  const message = ref('')
  const showCancel = ref(false)
  const confirmText = ref('OK')
  const cancelText = ref('Cancel')
  
  let resolvePromise: ((value: boolean) => void) | null = null

  const showDialog = (options: DialogOptions): Promise<boolean> => {
    title.value = options.title || ''
    message.value = options.message
    showCancel.value = options.showCancel || false
    confirmText.value = options.confirmText || 'OK'
    cancelText.value = options.cancelText || 'Cancel'
    isVisible.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  const showAlert = (message: string, title?: string): Promise<boolean> => {
    return showDialog({
      title,
      message,
      showCancel: false,
      confirmText: 'OK'
    })
  }

  const showConfirm = (message: string, title?: string): Promise<boolean> => {
    return showDialog({
      title,
      message,
      showCancel: true,
      confirmText: 'Yes',
      cancelText: 'No'
    })
  }

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    isVisible,
    title,
    message,
    showCancel,
    confirmText,
    cancelText,
    showDialog,
    showAlert,
    showConfirm,
    handleConfirm,
    handleCancel
  }
}
