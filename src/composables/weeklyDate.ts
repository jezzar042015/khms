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
        'en': 'January',
        'ceb': 'Enero',
        'war': 'Enero',
        'tl': 'Enero',
    },
    1: {
        'psp': 'February',
        'en': 'February',
        'ceb': 'Pebrero',
        'war': 'Pebrero',
        'tl': 'Pebrero',
    },
    2: {
        'psp': 'March',
        'en': 'March',
        'ceb': 'Marso',
        'war': 'Marso',
        'tl': 'Marso',
    },
    3: {
        'psp': 'April',
        'en': 'April',
        'ceb': 'Abril',
        'war': 'Abril',
        'tl': 'Abril',
    },
    4: {
        'psp': 'May',
        'en': 'May',
        'ceb': 'Mayo',
        'war': 'Mayo',
        'tl': 'Mayo',
    },
    5: {
        'psp': 'June',
        'en': 'June',
        'ceb': 'Hunyo',
        'war': 'Hunyo',
        'tl': 'Hunyo',
    },
    6: {
        'psp': 'July',
        'en': 'July',
        'ceb': 'Hulyo',
        'war': 'Hulyo',
        'tl': 'Hulyo',
    },
    7: {
        'psp': 'August',
        'en': 'August',
        'ceb': 'Agosto',
        'war': 'Agosto',
        'tl': 'Agosto',
    },
    8: {
        'psp': 'September',
        'en': 'September',
        'ceb': 'Septiyembre',
        'war': 'Septyembre',
        'tl': 'Setyembre',
    },
    9: {
        'psp': 'October',
        'en': 'October',
        'ceb': 'Oktubre',
        'war': 'Oktubre',
        'tl': 'Oktubre',
    },
    10: {
        'psp': 'November',
        'en': 'November',
        'ceb': 'Nobyembre',
        'war': 'Nobyembre',
        'tl': 'Nobyembre',
    },
    11: {
        'psp': 'December',
        'en': 'December',
        'ceb': 'Disyembre',
        'war': 'Disyembre',
        'tl': 'Disyembre',
    },
}