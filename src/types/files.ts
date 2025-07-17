export interface ContentDefault {
    publish: boolean;
    period: string;
    display: string;
    theme: string;
    thumbnail: string;
    title: string;
    weeks: WeekItem[];
    firstMonday: string
    // Add other properties as needed
}

export interface Content {
    default: ContentDefault;
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

export interface WeekItemFeed {
    id: string,
    week: string,
    bibleReading: string,
    hasEvent: boolean | undefined
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
    class?: string
    thumbnail?: string
    thumbnailMode?: 'w-50' | 'w-1/3' | 'sqr-c' | 'sqr-r'
    reference?: string
    roles: string[]
    autofills?: string[]
    isVisit?: boolean
    co?: string
    alt?: string
    writtable?: boolean
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
    type?: string
    isVisit?: boolean
    co?: string
    writtable?: boolean
    timeAdjustable?: boolean
}