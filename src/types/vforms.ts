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
    header?: string;
    msg: string;
    confirm: boolean;
    confirmText?: string;
    cancel: boolean;
    cancelText?: string;
    icon: AlertIcons;
}