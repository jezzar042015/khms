export interface Notification {
    id: string
    date: string
    title: string
    subheader: string
    isLink: boolean
    link?: string
    isUnread?: boolean
}