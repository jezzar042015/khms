export interface VisitDetail {
    weekId: string | null;
    talk: string | null;
    sjj: string | null;
    co: string | null;
}

export interface VisitsDetails {
    [key: string]: VisitDetail;
}