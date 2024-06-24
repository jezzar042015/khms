import type { MWBAssignment } from "@/types/mwb";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useFilesStore } from "./files";

const LOCAL_KEY_PREF = "khmsts-assign";

export const useAssignmentStore = defineStore('assignments', () => {

    const fileStore = useFilesStore()
    const assignments = ref<MWBAssignment[]>([])

    const loadedKeyCode = computed(() => {
        return `${LOCAL_KEY_PREF}${fileStore.currentPeriod}`
    })

    const get = computed(() => {
        return assignments.value
    })

    async function loadMonthAssignments() {
        const stored = localStorage.getItem(loadedKeyCode.value);
        if (stored == null || stored == 'null') {
            assignments.value = []
        } else {
            assignments.value = JSON.parse(stored)
        }
    }

    async function upsert(assignment: MWBAssignment) {
        const index = assignments.value.findIndex(a => a.pid === assignment.pid)

        if (index !== -1) {
            assignments.value.splice(index, 1, assignment)
        } else {
            assignments.value.push(assignment);
        }
    }

    function storeLocal() {
        localStorage.setItem(loadedKeyCode.value, JSON.stringify(assignments.value))
    }

    async function loadLocal() {
        const stored = localStorage.getItem(loadedKeyCode.value)
        if (stored != null || stored != 'null') {
            assignments.value = JSON.parse(stored ?? '')
        } else {
            assignments.value = []
            storeLocal()
        }
    }

    async function fetchAllLocal() {
        const records = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (!key.includes(LOCAL_KEY_PREF)) continue;
            const stored = localStorage.getItem(key)
            records.push({
                key, stored: JSON.parse(stored ?? '')
            })
        }
        return records;
    }

    async function resetCurrent() {
        localStorage.removeItem(loadedKeyCode.value)
    }

    async function resetAll() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;
            if (!key.includes(LOCAL_KEY_PREF)) continue;
            localStorage.removeItem(key)
        }
    }

    async function restore(data: { key: string, stored: any }[]) {
        for (const record of data) {
            localStorage.setItem(record.key, record.stored);
        }
    }

    watch(() => assignments.value, () => storeLocal(), { deep: true })

    return {
        get,
        upsert,
        loadMonthAssignments,
        loadLocal,
        resetCurrent,
        resetAll,
        fetchAllLocal,
        restore
    }
})