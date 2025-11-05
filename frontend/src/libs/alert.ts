export interface AlertOptions {
    message: string
    type: 'error' | 'warning' | 'info' | 'success'
    duration?: number
    el?: string | HTMLElement
}
/**
 * 错误提示
 * @param message 信息
 */
export const alertMessage = (message: string | AlertOptions, options?: Partial<AlertOptions>) => {
    if (typeof message !== 'string') {
        options = message
        message = options?.message || ''
    }
    if (!message) return
    const { type = 'error', duration = 2500 } = options || {}

    const msgEl = document.createElement('div')
    msgEl.innerHTML = message
    msgEl.className = `alert-${type}`
    msgEl.style.fontSize = '0.16rem'
    msgEl.style.lineHeight = '0.24rem'
    msgEl.style.padding = '0.12rem 0.16rem'
    msgEl.style.borderRadius = '0.08rem'
    msgEl.style.backgroundColor = '#fff'
    msgEl.style.boxShadow = '0 0 0.08rem 0 rgba(0, 0, 0, 0.1)'
    msgEl.style.color = `var(--color-${type})`

    let containerEl: HTMLElement | null = null
    if (options?.el) {
        containerEl = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    }
    if (!containerEl) {
        containerEl = document.createElement('div')
        containerEl.className = 'alert-container'
        containerEl.style.position = 'fixed'
        containerEl.style.top = '0'
        containerEl.style.left = '0'
        containerEl.style.zIndex = '1000'
        containerEl.style.width = '100%'
        containerEl.style.height = '100%'
        containerEl.style.display = 'flex'
        containerEl.style.flexDirection = 'column'
        containerEl.style.alignItems = 'center'
        containerEl.style.justifyContent = 'flex-start'
        containerEl.style.paddingTop = '10vh'
        document.body.appendChild(containerEl)
    }
    containerEl?.appendChild(msgEl)

    if (!options?.el && duration) {
        setTimeout(() => {
            containerEl?.remove()
        }, duration)
    }
}
export const alertSuccess = (message: string | AlertOptions, options?: Partial<AlertOptions>) => {
    alertMessage(message, { ...options, type: 'success' })
}
export const alertError = (message: string | AlertOptions, options?: Partial<AlertOptions>) => {
    alertMessage(message, { ...options, type: 'error' })
}
export const alertWarning = (message: string | AlertOptions, options?: Partial<AlertOptions>) => {
    alertMessage(message, { ...options, type: 'warning' })
}
export const alertInfo = (message: string | AlertOptions, options?: Partial<AlertOptions>) => {
    alertMessage(message, { ...options, type: 'info' })
}
