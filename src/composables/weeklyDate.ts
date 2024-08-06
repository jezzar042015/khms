import { useCongregationStore } from "@/stores/congregation"
import { useFilesStore } from "@/stores/files"
import { useVisitStore } from "@/stores/visits"

export function useWeeklyDate(weekId: string, weekDisplay: string, includeYear: boolean = false) {
    const fileStore = useFilesStore()
    const congStore = useCongregationStore()
    const visitStore = useVisitStore()

    if (typeof congStore.congregation.midweekDay == 'undefined') congStore.congregation.midweekDay = -1
    let midweekDay = congStore.congregation.midweekDay
    if (midweekDay < 0) return weekDisplay

    const firstMonday = new Date(fileStore.loadedMonth?.content.firstMonday ?? '')
    const weekindex = Number(weekId.split(".")[1])

    // handle visit meeting adjustment
    if (visitStore.hasMonthVisit) {
        const visitWeekId = visitStore.loadDetail?.weekId
        if (visitWeekId) {
            const id = visitWeekId.split('.')[1]
            if (Number(id) == weekindex) {
                midweekDay = 1
            }
        }
    }

    const offset = (weekindex - 1) * 7
    const date = firstMonday.setDate(firstMonday.getDate() + (offset + midweekDay))
    const lang = congStore.congregation.lang
    return format(date, lang, includeYear)
}

function format(date: number, lang: string, includeYear: boolean) {
    const d = new Date(date)
    const m = d.getMonth()
    const dy = d.getDate()
    const mmm = months[m][lang]

    return (includeYear) ? `${mmm} ${dy}, ${d.getFullYear()}` : `${mmm} ${dy}`
}

const months: Record<number, Record<string, string>> = {
    0: {
        'psp': 'January',
        'ceb': 'Enero',
        'war': 'Enero',
        'tl': 'Enero',
    },
    1: {
        'psp': 'February',
        'ceb': 'Pebrero',
        'war': 'Pebrero',
        'tl': 'Pebrero',
    },
    2: {
        'psp': 'March',
        'ceb': 'Marso',
        'war': 'Marso',
        'tl': 'Marso',
    },
    3: {
        'psp': 'April',
        'ceb': 'Abril',
        'war': 'Abril',
        'tl': 'Abril',
    },
    4: {
        'psp': 'May',
        'ceb': 'Mayo',
        'war': 'Mayo',
        'tl': 'Mayo',
    },
    5: {
        'psp': 'June',
        'ceb': 'Hunyo',
        'war': 'Hunyo',
        'tl': 'Hunyo',
    },
    6: {
        'psp': 'July',
        'ceb': 'Hulyo',
        'war': 'Hulyo',
        'tl': 'Hulyo',
    },
    7: {
        'psp': 'August',
        'ceb': 'Agosto',
        'war': 'Agosto',
        'tl': 'Agosto',
    },
    8: {
        'psp': 'September',
        'ceb': 'Septiyembre',
        'war': 'Septyembre',
        'tl': 'Setyembre',
    },
    9: {
        'psp': 'October',
        'ceb': 'Oktubre',
        'war': 'Oktubre',
        'tl': 'Oktubre',
    },
    10: {
        'psp': 'November',
        'ceb': 'Nobyembre',
        'war': 'Nobyembre',
        'tl': 'Nobyembre',
    },
    11: {
        'psp': 'December',
        'ceb': 'Disyembre',
        'war': 'Disyembre',
        'tl': 'Disyembre',
    },
}