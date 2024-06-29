import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type { PubRole } from "@/types/pubrole";
import type { Publisher } from "@/types/publisher";
import uid from "@/assets/utils/uid";

const LOCAL_KEY = 'khmsts-pubs';

export const usePublisherStore = defineStore('publisher', () => {

    const pubs = ref<Publisher[]>([]);

    const publishers = computed(() => {
        return [...pubs.value].sort((p1, p2) => {
            const name1 = p1.name ?? ''
            const name2 = p2.name ?? ''
            return name1.localeCompare(name2)
        });
    })

    const roles = ref<PubRole[]>([
        { code: "elder", display: "Elder" },
        { code: "ms", display: "MS" },
        { code: "cobe", display: "Coordinator" },
        { code: "so", display: "Service Overseer" },
        { code: "sec", display: "Secretary" },
        { code: "br", display: "3. Bible Reading" },
        { code: "talk", display: "Talks" },
        { code: "demo", display: "Demonstration" },
        { code: "cbs", display: "CBS Conductor" },
        { code: "rdr", display: "CBS Reader" },
    ])

    async function upsert(publisher: Publisher): Promise<string> {
        let mode = 'update'
        if (!publisher.id) {
            publisher.id = uid.generate()
            mode = 'insert'
        }

        if (mode == 'insert') {
            pubs.value.push(publisher)
        } else {
            const pubIndex = pubs.value.findIndex(p => p.id === publisher.id)
            pubs.value.splice(pubIndex, 1, publisher)
        }

        return mode
    }

    async function remove(id: string): Promise<void> {
        const pubIndex = pubs.value.findIndex(p => p.id === id)
        pubs.value.splice(pubIndex, 1)
    }

    function storeLocal(): void {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(pubs.value))
    }

    async function loadLocal(): Promise<void> {
        const stored = localStorage.getItem(LOCAL_KEY);
        if (stored == null || stored == 'null') {
            pubs.value = []
        } else {
            pubs.value = JSON.parse(stored)
        }
    }

    async function reset(): Promise<void> {
        localStorage.removeItem(LOCAL_KEY)
        await loadLocal()
    }

    watch(
        () => pubs.value,
        () => storeLocal(),
        { deep: true }
    )

    return {
        roles, publishers, pubs,
        // actions
        loadLocal, upsert, reset, remove
    }
})