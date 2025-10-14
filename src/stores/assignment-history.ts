import type { MWBAssignment } from "@/types/mwb";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAssignmentHistoryStore = defineStore('assign-history', () => {

    const stored = ref<MWBAssignment[]>([])

    const read = async () => {
        const assignments: MWBAssignment[] = [];

        // Regex for allowed keys and pid pattern
        const keyPattern = /^khmsts-parts-\d{6}$/;
        const pidPattern = /^\d{6}\.\d\.\d$/; // YYYYMM.d.d

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !keyPattern.test(key)) continue;

            try {
                const data = JSON.parse(localStorage.getItem(key) || '[]');
                if (Array.isArray(data)) {
                    const valid = data.filter((item: MWBAssignment) =>
                        Array.isArray(item.a) && pidPattern.test(item.pid)
                    );
                    assignments.push(...valid);
                }
            } catch (e) {
                console.warn(`Failed to parse localStorage item: ${key}`, e);
            }
        }

        stored.value = assignments;
    }

    const bibleReaders = computed(() => {
        const readers = stored.value.reduce<Record<string, string[]>>((acc, p) => {
            if (!p.pid.endsWith('.3')) return acc
            const name = p.a?.[0] ?? ''
            const date = p.pid.slice(0, 8)
                ; (acc[name] ??= []).push(date)
            return acc
        }, {})

        // Sort each array descending (most recent first)
        for (const dates of Object.values(readers)) {
            dates.sort((a, b) => b.localeCompare(a))
        }

        return readers
    })


    return {
        stored,
        bibleReaders,
        read
    }
})
