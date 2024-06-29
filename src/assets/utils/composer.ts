import translations from "./translations";
import { useFilesStore } from "@/stores/files";
import { useCongregationStore } from "@/stores/congregation";
import type { S140PartItem, S140PartWeeks, WeekItem } from "@/types/files";

let runtime = 0;
let lang: string = ''

export async function s140Builder(): Promise<S140PartWeeks> {
    const weeks: S140PartWeeks = {}
    const congStore = useCongregationStore()
    const fileStore = useFilesStore()
    if (!fileStore.loadedMonth) return weeks
    const sourceWeeks = fileStore.loadedMonth.content.weeks
    lang = congStore.congregation.lang

    for (const w in sourceWeeks) {
        runtime = 0
        const week = sourceWeeks[w]
        const weekid = week.id
        weeks[weekid] = []
        await buildWeekParts(week, weeks[weekid])
    }

    return weeks
}

async function buildWeekParts(source: WeekItem, composableWeek: S140PartItem[]) {
    opening(source, composableWeek);
    introduction(source, composableWeek)
    header(source, 'gems', composableWeek)
    gems(source, composableWeek)
    header(source, 'ministry', composableWeek)
    ministry(source, composableWeek)
    header(source, 'living', composableWeek)
    midsong(source, composableWeek);
    living(source, composableWeek)
    closing(source, composableWeek)
}

function opening(src: WeekItem, week: S140PartItem[]) {
    const part = {
        id: `${src.id}.op`,
        time: 4,
        title: `${translations.mwbs140[lang].song} ${src.songs[0]}`,
        roles: [
            'elder', 'ms'
        ],
        showNoTime: true,
        label: translations.mwbs140[lang].prayer,
        runtime: runtime
    }

    runtime = part.time + runtime + 1
    week.push(part)
}

function midsong(src: WeekItem, week: S140PartItem[]) {
    const part = {
        id: `${src.id}.ms`,
        time: 4,
        title: `${translations.mwbs140[lang].song} ${src.songs[1]}`,
        roles: [],
        showNoTime: true,
        runtime: runtime,
    }

    runtime = part.time + runtime
    week.push(part);
}

function closing(src: WeekItem, week: S140PartItem[]) {
    const part = {
        id: `${src.id}.cp`,
        time: 4,
        title: `${translations.mwbs140[lang].song} ${src.songs[2]}`,
        roles: [
            'elder', 'ms'
        ],
        showNoTime: true,
        label: translations.mwbs140[lang].prayer,
        runtime: runtime
    }

    runtime = part.time + runtime
    week.push(part)
}

function header(src: WeekItem, partCode: string, week: S140PartItem[]) {
    const part = {
        id: `${src.id}.h-${partCode}`,
        type: 'header',
        title: translations.mwbs140[lang][partCode],
        showNoTime: true,
        classNames: `s140-meetingbar part-${partCode}`
    }

    week.push(part)
}

function introduction(src: WeekItem, week: S140PartItem[]) {
    const pattern = src.parts.gems[0]
    const congStore = useCongregationStore()
    const hasAuxClass = congStore.congregation.classId > 1
    const part: S140PartItem = {
        id: pattern.id,
        time: pattern.time,
        runtime: runtime,
        title: pattern.reference ?? '',
        autofills: [...pattern.autofills ?? []],
        roles: [...pattern.roles],
        label: (hasAuxClass ? translations.mwbs140[lang].coCounselor + ' / ' : '')
            + translations.mwbs140[lang].chairman,
    }

    runtime = (part.time ?? 1) + runtime
    week.push(part)
}

function gems(src: WeekItem, week: S140PartItem[]) {
    const parts = src.parts.gems
    for (const s in parts) {
        if (s != '0') {
            const pattern = parts[s]
            const part: S140PartItem = {
                id: pattern.id,
                time: pattern.time,
                runtime: runtime,
                thumbnail: pattern.thumbnail,
                reference: pattern.reference,
                title: pattern.title ?? '',
                autofills: [...pattern.autofills ?? []],
                roles: [...pattern.roles ?? []],
            }

            if ((part.roles ?? []).includes('br')) {
                part.label = translations.mwbs140[lang].student
            }

            part.runtime = runtime
            runtime = (part.time ?? 1) + runtime + 1

            week.push(part)
        }
    }
}

function ministry(src: WeekItem, week: S140PartItem[]) {
    const parts = src.parts.ministry
    for (const pattern of parts) {
        const part: S140PartItem = {
            id: pattern.id,
            time: pattern.time,
            runtime: runtime,
            thumbnail: pattern.thumbnail,
            reference: pattern.reference,
            title: pattern.title ?? '',
            autofills: [...pattern.autofills ?? []],
            roles: [...pattern.roles ?? []],
        }

        if ((part.roles ?? []).includes('demo')) {
            part.label = translations.mwbs140[lang].demo
        }

        if ((part.roles ?? []).includes('talk')) {
            part.label = translations.mwbs140[lang].student
        }

        part.runtime = runtime
        runtime = (part.time ?? 1) + runtime + 1

        week.push(part)
    }
}

function living(src: WeekItem, week: S140PartItem[]) {
    const parts = src.parts.living;

    for (const pattern of parts) {
        const part: S140PartItem = {
            id: pattern.id,
            time: pattern.time,
            runtime: runtime,
            thumbnail: pattern.thumbnail,
            reference: pattern.reference,
            title: pattern.title ?? pattern.reference ?? '',
            autofills: [...pattern.autofills ?? []],
            roles: [...pattern.roles ?? []],
        }

        if (part.roles?.includes('cbs'))
            part.label = translations.mwbs140[lang].conductor

        if (part.id.includes('.r'))
            part.label = pattern.alt?.replace(':', '')

        if (pattern.isVisit) {
            part.roles?.push('co');
            part.title = "1st Service Talk: " + (part.title ?? '');
            part.co = pattern.co;
        }

        part.runtime = runtime
        runtime = (part.time ?? 0) + runtime

        week.push(part)
    }
}

