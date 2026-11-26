import type { Override } from "@/types/overrides";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { useFilesStore } from "./files";

export const useOverridesStore = defineStore('overrides', () => {
    const stored = useStorage<Override[]>('khmsts-overrides', [])
    const fileStore = useFilesStore()

    const save = (override: Override) => {
        const index = stored.value.findIndex(o => o.id === override.id)
        if (index !== -1) {
            stored.value.splice(index, 1, override)
        } else {
            stored.value.push(override)
        }
    }

    const read = (id: string) => {
        const override = stored.value.find(o => o.id === id)
        return override ?? null
    }


    const remove = (id: string) => {
        const index = stored.value.findIndex(o => o.id === id)
        if (index !== -1) {
            stored.value.splice(index, 1)
        }
    }

    const prune = async () => {
        const ids = await fileStore.activeMonthIds()

        // Filter instead of removing while iterating (which skips elements)
        const kept = stored.value.filter(o => ids.includes(o.id.split('.')[0]))
        if (kept.length !== stored.value.length) stored.value = kept
    }

    return {
        stored,
        read, save, remove, prune
    }
})