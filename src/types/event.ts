export interface EventDetail {
    code: string | undefined;
    weekId: string | undefined;
    theme: string | undefined;
}

export interface EventsDetails {
    [key: string]: EventDetail;
}

export interface EventOption {
    code: string
    name: string
}