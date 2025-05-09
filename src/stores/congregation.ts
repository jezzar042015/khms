import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type { Congregation, Language, MWBClass } from "@/types/congregation";

const LOCAL_KEY = 'khmsts-cong';

export const useCongregationStore = defineStore('congregation', () => {

    const congregation = ref<Congregation>({
        name: '',
        lang: '',
        midweekTime: '18:00',
        midweekDay: -1,
        classId: 1,
        mwbTemplate: 's-140'
    })

    const languages = ref<Language[]>([
        { code: 'bcl', support: true, lang: 'Bicol' },
        { code: 'ceb', support: true, lang: 'Cebuano' },
        { code: 'en', support: true, lang: 'English' },
        { code: 'psp', support: true, lang: 'Filipino Sign Language' },
        { code: 'hil', support: true, lang: 'Hiligaynon' },
        { code: 'ilo', support: true, lang: 'Iloko' },
        { code: 'pag', support: true, lang: 'Pangasinan' },
        { code: 'tl', support: true, lang: 'Tagalog' },
        { code: 'war', support: true, lang: 'Waray-waray' },
    ]);

    const ministryClasses = ref<MWBClass[]>([
        { id: 1, display: "Main Hall Only", supported: true },
        { id: 2, display: "With Auxillary Class", supported: true },
    ])

    const mwbMeetingDays = ref([
        { id: -1, label: 'Not Set' },
        { id: 0, label: 'Monday' },
        { id: 1, label: 'Tuesday' },
        { id: 2, label: 'Wednesday' },
        { id: 3, label: 'Thursday' },
        { id: 4, label: 'Friday' },
        { id: 5, label: 'Saturday' },
        // { id: 6, label: 'Sunday' },
    ])

    const supportedLanguages = computed<Language[]>(() => {
        return languages.value.filter(l => l.support)
    })

    const supportedClasses = computed<MWBClass[]>(() => {
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
                midweekDay: -1,
                classId: 1,
                mwbTemplate: 's-140'
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
        mwbMeetingDays,
        ministryClasses,
        loadLocal,
        reset
    }
})