export interface Congregation {
    name: string,
    lang: string,
    midweekTime: string,
    midweekDay: number,
    classId: number,
    mwbTemplate: string,
}

export interface MWBClass {
    id: number,
    display: string,
    supported: boolean,
}

export interface Language {
    code: string,
    support: boolean,
    lang: string,
}