import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useCongregationStore } from "./congregation";
import { useVisitStore } from "./visits";
import { useEventStore } from "./events";
import { useFilesStore } from "./files";

export const useViewStore = defineStore('views', () => {

    type Views = 'welcome' | 'mwb' | 'pubs' | 'slips'
    const view = ref<Views>('welcome')

    const congStore = useCongregationStore()
    const visitStore = useVisitStore()
    const eventStore = useEventStore()
    const fileStore = useFilesStore()

    const welcomePage = computed<boolean>(() => {
        return view.value == 'welcome'
    })

    const mwbTemplate = computed<boolean>(() => {
        return view.value == "mwb"
    });

    const pubsList = computed<boolean>(() => {
        return view.value == "pubs"
    });

    const assignmentSlips = computed<boolean>(() => {
        return view.value == "slips"
    });

    function setView(viewName: Views): void {
        view.value = viewName
    }

    async function init(): Promise<boolean> {
        const congname = congStore.congregation.name
        const lang = congStore.congregation.lang
        const classId = congStore.congregation.classId

        if (!congname || (!lang && !classId)) {
            setView("welcome")
        } else {
            setView("mwb")
        }

        return !welcomePage.value
    }

    async function exitWelcome(): Promise<void> {
        setView("mwb")
        await visitStore.loadLocal();
        await eventStore.loadLocal();
        await fileStore.loadFiles();
        await fileStore.loadMonthTemplate();
    }

    return {
        welcomePage, mwbTemplate,
        pubsList, assignmentSlips,
        init, exitWelcome,
        setView
    }
})