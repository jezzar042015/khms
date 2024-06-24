import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";
import { cloneDeep } from 'lodash';
import { useCongregationStore } from "./congregation";
import { useVisitStore } from "./visits";
import { useEventStore } from "./events";
import { s140Builder } from "@/assets/utils/composer";
import type { Content, LangMonth } from "@/types/files";
import type { VisitDetail } from "@/types/visit";

const jsonFilesCeb = import.meta.glob('@/lib/ceb/*.json');
const jsonFilesPsp = import.meta.glob('@/lib/psp/*.json');
const jsonFilesWar = import.meta.glob('@/lib/war/*.json');
const jsonFilesTl = import.meta.glob('@/lib/tl/*.json');

export const useFilesStore = defineStore('files', () => {

    const congStore = useCongregationStore()
    const langMonths = ref<LangMonth[]>([])
    const currentPeriod = ref('')
    const loadedMonth = ref<LangMonth | undefined>({
        name: '',
        content: {
            publish: false,
            period: '',
            display: '',
            theme: '',
            thumbnail: '',
            weeks: [],
        }
    });

    const templates = ref([
        { code: 's-140', supported: true, name: "S-140 Template" },
        { code: 'a-100', supported: true, name: "Customized Template" },
    ]);

    const s140PartItems = ref({})

    const periodIsInMonths = computed(() => {
        const exist = langMonths.value.find(m => m.content.period == currentPeriod.value)
        return Boolean(exist)
    })

    async function loadFiles() {
        const lang = congStore.congregation.lang;

        if (!lang) return

        const jsonfiles = getFiles(lang)
        langMonths.value = []

        for (const path in jsonfiles) {
            const filePath: string = path;
            const fileName = filePath.split('/').pop();

            if (fileName === undefined) {
                console.error(`File name could not be determined from path: ${filePath}`);
                continue;
            }

            try {
                if (typeof jsonfiles[filePath] === 'function') {
                    const content: Content = await jsonfiles[filePath]() as Content;

                    if (content.default.publish) {
                        langMonths.value.unshift({
                            name: fileName,
                            content: content.default
                        });
                    }

                } else {
                    console.error(`No function found for path: ${filePath}`);
                }
            } catch (error) {
                console.error(`Error processing file ${fileName}: ${error}`);
            }
        }
    }

    async function loadMonthTemplate(monthCode?: string) {

        if (!monthCode) {
            const period = langMonths.value[0].content.period;
            currentPeriod.value = period

            const targetMonth = period
                ? langMonths.value.find(f => f.name === `${period}.json`)
                : null;
            loadedMonth.value = cloneDeep(targetMonth || langMonths.value[0]);
        } else {
            const cloned = cloneDeep(langMonths.value.find(f => f.name === `${monthCode}.json`)) as LangMonth;
            loadedMonth.value = cloned
        }

        await loadMonthVisit()
        await loadMonthEvent()
        await composeS140()
    }

    async function composeS140() {
        const congStore = useCongregationStore()
        if (congStore.congregation.mwbTemplate != "s-140") return

        s140PartItems.value = await s140Builder()
    }

    async function loadMonthEvent() {
        const eventStore = useEventStore()
        const hasEvent = eventStore.hasMonthEvent === 'Y'
        if (!hasEvent) return

        const event = eventStore.details[currentPeriod.value]
        if (!event.weekId) return
        if (!loadedMonth.value) return
        const eventWeek = loadedMonth.value.content.weeks.find(w => w.id == event.weekId)
        if (eventWeek) eventWeek.hasEvent = true
    }

    async function loadMonthVisit() {
        const visitStore = useVisitStore()
        const hasVisit = visitStore.hasMonthVisit === 'Y'
        if (!hasVisit) return

        const detail = visitStore.details[currentPeriod.value]
        if (!detail.weekId) return
        await manageCoPart(detail)
    }

    async function manageCoPart(detail: VisitDetail) {
        if (!loadedMonth.value) return
        const targetWeek = loadedMonth.value.content.weeks.find(w => w.id == detail.weekId);
        if (!targetWeek) return

        const cbsPart = targetWeek.parts.living.find(p => p.roles.includes('cbs'))
        if (!cbsPart) return

        // replacing the CO Part
        cbsPart.thumbnail = "https://cms-imgp.jw-cdn.org/img/p/1011229/univ/art/1011229_univ_sqr_lg.jpg";
        cbsPart.title = detail.talk ?? ''
        cbsPart.reference = 'CO\'s 1st Service Talk';
        cbsPart.isVisit = true;
        cbsPart.co = detail.co ?? ''

        // removing the CBS reader if exist
        const readerId = `${cbsPart.id}.r`;
        targetWeek.parts.living = targetWeek.parts.living.filter(p => p.id !== readerId);

        // change the position of co part and conclusion


        // replacing the last song
        if (detail.sjj) targetWeek.songs[2] = detail.sjj
    }

    watch(
        () => currentPeriod.value,
        (n) => {
            if (n) loadMonthTemplate(n)
        }
    )

    watch(
        () => congStore.congregation.lang,
        async (n, o) => {
            if (n && o != '') {
                await loadFiles()
                const period = periodIsInMonths.value ? currentPeriod.value : undefined
                await loadMonthTemplate(period)
            }
        },
        { immediate: false }
    )

    watch(
        () => congStore.congregation.mwbTemplate,
        () => composeS140()
    )

    return {
        currentPeriod,
        loadFiles,
        langMonths, loadedMonth,
        loadMonthTemplate,
        templates, s140PartItems
    }
})

function getFiles(lang: string) {
    if (lang === 'ceb') {
        return jsonFilesCeb;
    } else if (lang === 'psp') {
        return jsonFilesPsp;
    } else if (lang === 'war') {
        return jsonFilesWar;
    } else if (lang === 'tl') {
        return jsonFilesTl;
    }
}
