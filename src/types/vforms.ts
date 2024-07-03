export interface FormCongSettings {
    showLabels: boolean,
    PhCong: string,
    PhLanguage: string,
    PhClasses: string,
    showConfirm: boolean,
    showSubtitle: boolean,
}

type AlertIcons = 'warning' | 'success' | 'danger' | 'info' | 'none'

export interface AlertSettings {
    header: string | undefined
    msg: string
    confirm: boolean
    confirmText: string | undefined
    cancel: boolean
    cancelText: string | undefined
    icon: AlertIcons
}