export interface ContentDefault {
    publish: boolean;
    period: string;
    display: string;
    theme: string;
    thumbnail: string;
    weeks: WeekItem[];
    // Add other properties of content.default as needed
}

export interface Content {
    default: ContentDefault;
    // Add other properties of content as needed
}

export interface LangMonth {
    name: string;
    content: ContentDefault;
}

export interface LangMonths {
    value: LangMonth[];
}

export interface WeekItem {
    id: string
    week: string
    bibleReading: string
    songs: (string | number)[]
    parts: WeekPartGroups
    hasEvent?: boolean
}

export interface WeekPartGroups {
    gems: PartItem[]
    ministry: PartItem[]
    living: PartItem[]
}

export interface PartItem {
    id: string
    time: number
    title?: string
    class: string
    thumbnail: string
    reference: string
    roles: string[]
    autofills?: string[]
    isVisit: boolean | undefined
    co: string | undefined
    alt?: string
}

export interface S140PartWeeks {
    [key: string]: S140PartItem[]
}

export interface S140PartItem {
    id: string
    time?: number
    runtime?: number
    title: string
    roles?: string[]
    showNoTime?: boolean
    label?: string
    classNames?: string
    autofills?: string[]
    thumbnail?: string
    reference?: string
}