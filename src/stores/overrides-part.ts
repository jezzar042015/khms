import type { PartItem } from "@/types/files";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { useTimeOverrides } from "./overrides-time";

export const usePartsOverride = defineStore('parts-override', () => {

    const timeOverride = useTimeOverrides()
    const stored = useStorage<PartItem[]>('khmsts-p-overrides', [])
    const read = (id: string) => {
        const override = stored.value.find(o => o.id === id)
        return override ?? null
    }

    const save = (override: PartItem) => {
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
        timeOverride.remove(id)
    }

    return {
        stored,
        read, save, remove
    }
})