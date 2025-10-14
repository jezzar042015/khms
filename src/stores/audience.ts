import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export const useAudienceStore = defineStore('audience', () => {
    const stored = useStorage<string[]>('khmsts-audiences', [])
    const add = (newAudience: string) => {
        const isUnique = !stored.value.includes(newAudience)
        if (isUnique) stored.value.push(newAudience)
    }

    return {
        stored,
        add
    }
})