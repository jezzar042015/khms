import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useFilesStore } from "./files";
import type { EventDetail, EventOption, EventsDetails } from "@/types/event";

export const useEventStore = defineStore('events', () => {
    const EVENTS_STORAGE_KEY = 'khmsts-events'
    const DETAIL_STORAGE_KEY = 'khmsts-events-detail'

    const details = ref<EventsDetails>({})
    const months = ref<string[]>([])
    const fileStore = useFilesStore()

    const options = ref<EventOption[]>(
        [
            { code: 'rc', name: "Regional Convention" },
            { code: 'cabr', name: "Circuit Assembly with Branch Representative" },
            { code: 'caco', name: "Circuit Assembly with Circuit Overseer" },
        ]
    );

    const hasMonthEvent = computed(() => {
        return months.value.includes(fileStore.currentPeriod) ? 'Y' : 'N'
    })

    const loadDetail = computed(() => {
        if (!hasMonthEvent.value) return null
        const key = fileStore.currentPeriod
        return details.value[key]
    })

    function setEvent(detail: EventDetail, isAddEvent: boolean = true) {
        const key = fileStore.currentPeriod
        if (isAddEvent) {
            const exist = months.value.includes(key)
            if (!exist) months.value.push(key)
            details.value[key] = detail
        } else {
            const i = months.value.indexOf(key)
            months.value.splice(i, 1)
            delete details.value[key]
        }
        storeLocal()
    }

    const detail = computed(() => {
        const basic = details.value[fileStore.currentPeriod]
        const event = options.value.find(e => e.code == basic.code)

        if (!fileStore.loadedMonth) return null

        const week = fileStore.loadedMonth.content.weeks.find(w => w.id == basic.weekId)
        const colorTheme = fileStore.loadedMonth.content.theme;

        return {
            theme: basic.theme,
            event,
            week,
            colorTheme,
        }
    })

    function storeLocal(): void {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(months.value))
        localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(details.value))
    }

    async function loadLocal() {
        const storeEvents = localStorage.getItem(EVENTS_STORAGE_KEY)
        const storeDetails = localStorage.getItem(DETAIL_STORAGE_KEY)

        if (storeEvents) months.value = JSON.parse(storeEvents) ?? []
        if (storeDetails) details.value = JSON.parse(storeDetails) ?? {}
    }

    function reset() {
        localStorage.removeItem(EVENTS_STORAGE_KEY)
        localStorage.removeItem(DETAIL_STORAGE_KEY)
        loadLocal()
    }

    watch(
        () => details.value,
        () => storeLocal(),
        { deep: true }
    )

    return {
        storeLocal, loadLocal, hasMonthEvent, options,
        months, details, detail, setEvent, reset, loadDetail
    }
})