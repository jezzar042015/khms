import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useAudienceStore = defineStore('audience', () => {
    const stored = useStorage<string[]>('khmsts-audiences', [])

    /**
     * Adds a string item to the options array
    */
    const add = (newAudience: string) => {
        const isUnique = !stored.value.includes(newAudience)
        if (isUnique) stored.value.push(newAudience)
    }

    const remove = (target: string) => {
        const exist = stored.value.includes(target)
        if (exist) stored.value = stored.value.filter(f => f !== target)
    }

    return {
        stored,
        add,
        remove
    }
})