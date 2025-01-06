import { defineStore } from "pinia";
import { useStorage } from '@vueuse/core'
import { useViewStore } from "./views";

export const useSurveysStore = defineStore('surveys', () => {
    const TARGET_SURVEY = 'khmsts-survey-001'
    const TARGET_MONTH_USAGE = 'khmsts-parts-202411'

    const viewStore = useViewStore()

    const data = useStorage(TARGET_SURVEY, {
        attempt: null as null | Date,
        completed: null as null | Date,
        declines: 0,
        lastDeclined: null as null | Date,
    })

    const monthUsage = useStorage(TARGET_MONTH_USAGE, [])

    async function load() {
        viewStore.survey = await setVisibility()
    }

    async function setVisibility() {
        let hasDeclinedToday = false

        // check if declined today
        if (data?.value?.lastDeclined) {
            const lastDeclined = new Date(data.value.lastDeclined)
            hasDeclinedToday = !isOlder(lastDeclined)
        }

        // exclude new users
        if (monthUsage?.value) {
            const hasUsage = monthUsage.value.length > 0
            if (!hasUsage) return false
        }

        // Check conditions for visibility
        if (!data.value.attempt &&
            viewStore.mwbTemplate &&
            !hasDeclinedToday) {
            return true
        }

        return false
    }

    function declined() {
        data.value.declines++
        data.value.lastDeclined = new Date()
    }

    function isOlder(date: Date) {
        if (!(date instanceof Date)) {
            throw new Error("Invalid input: The provided value is not a Date object.");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < today;
    }

    return {
        data, load, declined
    }
})