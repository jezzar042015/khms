import { defineStore } from "pinia";
import { useCongregationStore } from "./congregation";
import { useStorage } from "@vueuse/core";
import { computed } from "vue";

export const useTracker = defineStore('tracker', () => {
    const cong = useCongregationStore()
    const ts = useStorage<string>('khmsts-track-ts', '')

    const shouldTrack = computed(() => {
        if (!cong.congregation.name || !cong.congregation.lang) return false

        // no timestamp yet → allow tracking
        if (!ts.value) return true

        const lastDate = new Date(ts.value)
        const today = new Date()

        const isSameDate =
            lastDate.getFullYear() === today.getFullYear() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getDate() === today.getDate()

        return !isSameDate
    })

    const track = async () => {
        const url = 'https://script.google.com/macros/s/AKfycbykPMZqy-ztAL15ZZTctlnWdu6Zwb0NwObH161tof0H5XBU2W5PAfqNlEvVATuGGBmxJQ/exec';
        const response = await fetch(url, {
            method: 'POST',
            // Google Apps Script requires the 'follow' redirect mode, 
            // but 'cors' is the default and usually works fine.
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain', // Using text/plain avoids CORS "preflight" issues with GAS
            },
            body: JSON.stringify({
                cong: cong.congregation.name,
                lang: cong.congregation.lang,
                classes: cong.congregation.classId,
            })
        });

        const result = await response.json() as {
            message: string
            tracked: boolean
            timestamp: string
        }

        ts.value = result.timestamp
    }

    return {
        track,
        shouldTrack
    }
})