export interface Notification {
    id: string
    date: string
    title: string
    subheader: string
    isLink: boolean
    link?: string
    unread?: boolean
    icon: 'new' | 'help'
}