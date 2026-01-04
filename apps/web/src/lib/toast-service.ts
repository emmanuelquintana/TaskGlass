type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
    title?: string
    message: string
    type?: ToastType
    duration?: number
}

type ToastListener = (toast: ToastOptions) => void

class ToastService {
    private listeners: ToastListener[] = []

    subscribe(listener: ToastListener) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener)
        }
    }

    notify(options: ToastOptions) {
        this.listeners.forEach((l) => l(options))
    }

    success(message: string, title?: string) {
        this.notify({ type: 'success', message, title })
    }

    error(message: string, title?: string) {
        this.notify({ type: 'error', message, title })
    }

    info(message: string, title?: string) {
        this.notify({ type: 'info', message, title })
    }

    warning(message: string, title?: string) {
        this.notify({ type: 'warning', message, title })
    }
}

export const toastService = new ToastService()
