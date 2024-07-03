export type AlertIcons = 'warning' | 'success' | 'error' | 'info' | 'none'

export interface FormCongSettings {
    showLabels: boolean,
    PhCong: string,
    PhLanguage: string,
    PhClasses: string,
    showConfirm: boolean,
    showSubtitle: boolean,
}

export interface AlertSettings {
    confirm?: boolean
    confirmText?: string
    header?: string
    icon?: AlertIcons
    msg?: string
    cancel?: boolean
    cancelText?: string
}