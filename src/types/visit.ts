export interface VisitDetail {
    weekId: string | undefined;
    talk: string | undefined;
    sjj: string | undefined;
    co: string | undefined;
}

export interface VisitsDetails {
    [key: string]: VisitDetail;
}