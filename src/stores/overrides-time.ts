import type { TimeOverride } from "@/types/override-time";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useTimeOverrides = defineStore('time-overrides', () => {
    const stored = useStorage<TimeOverride[]>('khmsts-t-overrides', [])

    const read = (id: string) => {
        const override = stored.value.find(o => o.id === id)
        return override ?? null
    }

    const save = (override: TimeOverride) => {
        const index = stored.value.findIndex(o => o.id === override.id)
        if (index !== -1) {
            stored.value.splice(index, 1, override)
        } else {
            stored.value.push(override)
        }
    }

    const remove = (id: string) => {
        const index = stored.value.findIndex(o => o.id === id)
        if (index !== -1) {
            stored.value.splice(index, 1)
        }
    }
    return {
        read, save, remove
    }
})