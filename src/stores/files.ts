import { computed, ref, watch, watchEffect } from "vue";
import { defineStore } from "pinia";
import { cloneDeep } from 'lodash';
import { useCongregationStore } from "./congregation";
import { useVisitStore } from "./visits";
import { useEventStore } from "./events";
import { useAssignmentStore } from "./assignment";
import { s140Builder } from "@/assets/utils/composer";
import type { Content, LangMonth, PartItem, S140PartWeeks } from "@/types/files";
import type { VisitDetail } from "@/types/visit";

const jsonFilesCeb = import.meta.glob('@/lib/ceb/*.json');
const jsonFilesPsp = import.meta.glob('@/lib/psp/*.json');
const jsonFilesWar = import.meta.glob('@/lib/war/*.json');
const jsonFilesTl = import.meta.glob('@/lib/tl/*.json');

export const useFilesStore = defineStore('files', () => {

    const congStore = useCongregationStore()
    const assignStore = useAssignmentStore()
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
            title: '',
            firstMonday: '',
        }
    });

    const templates = ref([
        { code: 's-140', supported: true, name: "S-140 Template" },
        { code: 'a-100', supported: true, name: "Customized Template" },
    ]);

    const s140PartItems = ref<S140PartWeeks>({})

    const periodIsInMonths = computed<boolean>(() => {
        const exist = langMonths.value.find(m => m.content.period == currentPeriod.value)
        return Boolean(exist)
    })

    const weekOptions = computed<{ id: string, name: string }[]>(() => {
        const month = loadedMonth.value
        if (!month) return [];
        return (month.content.weeks ?? []).map(w => ({
            id: w.id,
            name: w.week
        }))
    })

    const studentsParts = ref<PartItem[]>([]);

    watchEffect(async () => {
        const list: PartItem[] = [];
        if (!loadedMonth.value) {
            studentsParts.value = list;
            return;
        }

        const hasAux = congStore.congregation.classId === 2;

        for (const week of loadedMonth.value.content.weeks) {
            const br = week.parts.gems.find(p => p.roles.includes('br'));
            if (br) list.push({ ...br });

            const students = week.parts.ministry.filter(p => p.roles.includes('demo') || p.roles.includes('talk'));
            list.push(...students);

            if (hasAux) {
                const auxStudents = await auxiliaryStudentParts(br, students);
                list.push(...auxStudents);
            }
        }

        studentsParts.value = list;
    });

    const auxiliaryStudentParts = async (br: PartItem | undefined, students: PartItem[]): Promise<PartItem[]> => {
        const list: PartItem[] = [];

        if (br && students.length > 0) {
            const brAssistant = { ...br };
            brAssistant.id = `${brAssistant.id}.ax1`;
            list.push(brAssistant);
        }

        if (students) {
            for (const student of students) {
                const s = { ...student };
                s.id = `${student.id}.ax1`;
                list.push(s);
            }
        }

        return list;
    };


    async function loadFiles(): Promise<void> {
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
                        langMonths.value.push({
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

    async function loadMonthTemplate(monthCode?: string): Promise<void> {

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
        await assignStore.loadMonthAssignments()

    }

    async function composeS140(): Promise<void> {
        const congStore = useCongregationStore()
        if (congStore.congregation.mwbTemplate != "s-140") return

        s140PartItems.value = await s140Builder()
    }

    async function loadMonthEvent(): Promise<void> {
        const eventStore = useEventStore()
        const hasEvent = eventStore.hasMonthEvent
        if (!hasEvent) return

        const event = eventStore.details[currentPeriod.value]
        if (!event.weekId) return
        if (!loadedMonth.value) return
        const eventWeek = loadedMonth.value.content.weeks.find(w => w.id == event.weekId)
        if (eventWeek) eventWeek.hasEvent = true
    }

    async function loadMonthVisit(): Promise<void> {
        const visitStore = useVisitStore()
        const hasVisit = visitStore.hasMonthVisit
        if (!hasVisit) return

        const detail = visitStore.details[currentPeriod.value]
        if (!detail.weekId) return
        await manageCoPart(detail)
    }

    async function manageCoPart(detail: VisitDetail): Promise<void> {
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
        async () => await composeS140()
    )

    return {
        currentPeriod,
        loadFiles, studentsParts,
        langMonths, loadedMonth,
        loadMonthTemplate,
        templates, s140PartItems, weekOptions
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
