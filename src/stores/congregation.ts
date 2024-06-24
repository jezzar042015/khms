import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type { Congregation, Language, MWBClass } from "@/types/congregation";

const LOCAL_KEY = 'khmsts-cong';

export const useCongregationStore = defineStore('congregation', () => {

    const congregation = ref<Congregation>({
        name: '',
        lang: '',
        midweekTime: '18:00',
        classId: 1,
        mwbTemplate: 'a-100'
    })

    const languages = ref<Language[]>([
        { code: 'ceb', support: true, lang: 'Cebuano' },
        { code: 'psp', support: true, lang: 'Filipino Sign Language' },
        { code: 'war', support: true, lang: 'Waray-waray' },
        { code: 'tl', support: true, lang: 'Tagalog' },
    ]);

    const ministryClasses = ref<MWBClass[]>([
        { id: 1, display: "Main Hall Only", supported: true },
        { id: 2, display: "With Auxillary Class", supported: false },
    ])

    const supportedLanguages = computed(() => {
        return languages.value.filter(l => l.support)
    })

    const supportedClasses = computed(() => {
        return ministryClasses.value.filter(c => c.supported)
    })

    function storeLocal(): void {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(congregation.value))
    }

    async function loadLocal(): Promise<void> {
        const stored = localStorage.getItem(LOCAL_KEY);
        if (stored == null || stored == 'null') {
            congregation.value = {
                name: '',
                lang: '',
                midweekTime: '18:00',
                classId: 0,
                mwbTemplate: 'a-100'
            }
        } else {
            congregation.value = JSON.parse(stored)
        }
    }

    async function reset(): Promise<void> {
        localStorage.removeItem(LOCAL_KEY)
        await loadLocal()
    }

    watch(
        () => congregation.value,
        () => storeLocal(),
        { deep: true }
    )

    return {
        congregation,
        supportedLanguages, supportedClasses,
        ministryClasses,
        loadLocal,
        reset
    }
})