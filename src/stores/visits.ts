import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useFilesStore } from "./files";
import type { VisitDetail, VisitsDetails } from "@/types/visit";

const VISITS_STORAGE_KEY = 'khmsts-visits'
const VISITS_DETAILS_KEY = 'khmsts-visits-detail'

export const useVisitStore = defineStore('visits', () => {
    const details = ref<VisitsDetails>({})
    const months = ref<string[]>([])
    const fileStore = useFilesStore()

    const hasMonthVisit = computed<boolean>(() => {
        return months.value.includes(fileStore.currentPeriod)
    })

    const loadDetail = computed<VisitDetail | null>(() => {
        if (!hasMonthVisit.value) return null
        const key = fileStore.currentPeriod
        return details.value[key]
    })

    function setVisit(detail: VisitDetail, isToAdd: boolean = true): void {
        const key = fileStore.currentPeriod
        if (isToAdd) {
            const exist = months.value.includes(key)
            if (!exist) months.value.push(key)
            details.value[key] = detail
        } else {
            const i = months.value.indexOf(key)
            months.value.splice(i, 1)
            delete details.value[key]
        }
        storeLocal();
    }

    function storeLocal(): void {
        localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(months.value))
        localStorage.setItem(VISITS_DETAILS_KEY, JSON.stringify(details.value))
    }

    async function loadLocal(): Promise<void> {
        const storeVisits = localStorage.getItem(VISITS_STORAGE_KEY)
        const storeDetails = localStorage.getItem(VISITS_DETAILS_KEY)

        if (storeVisits) months.value = JSON.parse(storeVisits) ?? []
        if (storeDetails) details.value = JSON.parse(storeDetails) ?? {}
    }

    function reset() {
        localStorage.removeItem(VISITS_STORAGE_KEY)
        localStorage.removeItem(VISITS_DETAILS_KEY)
        loadLocal()
    }

    watch(
        () => details.value,
        () => storeLocal(),
        { deep: true }
    )

    return {
        storeLocal, setVisit, loadLocal,
        hasMonthVisit,
        details, months,
        reset, loadDetail
    }
})