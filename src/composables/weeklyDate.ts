import { useCongregationStore } from "@/stores/congregation"
import { useFilesStore } from "@/stores/files"
import { format } from "date-fns"

export function useWeeklyDate(weekId: string, weekDisplay: string) {
    const fileStore = useFilesStore()
    const congStore = useCongregationStore()

    if (typeof congStore.congregation.midweekDay == 'undefined') congStore.congregation.midweekDay = -1
    const midweekDay = congStore.congregation.midweekDay
    if (midweekDay < 0) return weekDisplay

    const firstMonday = new Date(fileStore.loadedMonth?.content.firstMonday ?? '')
    const weekindex = Number(weekId.split(".")[1])
    const offset = (weekindex - 1) * 7
    const date = firstMonday.setDate(firstMonday.getDate() + (offset + midweekDay))
    return format(date, 'MMMM d')
}