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

        for (const override of stored.value) {
            const overrideMonth = override.id.split('.')[0]
            if (!ids.includes(overrideMonth)) {
                remove(override.id)
            }
        }
    }

    return {
        stored,
        read, save, remove, prune
    }
})