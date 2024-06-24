export interface EventDetail {
    code: string | null;
    weekId: string | null;
    theme: string | null;
}

export interface EventsDetails {
    [key: string]: EventDetail;
}

export interface EventOption {
    code: string
    name: string
}