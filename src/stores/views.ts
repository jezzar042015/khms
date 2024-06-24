import { defineStore } from "pinia";
import { ref } from "vue";
import { useCongregationStore } from "./congregation";
import { useVisitStore } from "./visits";
import { useEventStore } from "./events";
import { useFilesStore } from "./files";

export const useViewStore = defineStore('views', () => {
    const welcomePage = ref(false);
    const mwbTemplate = ref(false);
    const pubsDispayPage = ref(false);

    const congStore = useCongregationStore()
    const visitStore = useVisitStore()
    const eventStore = useEventStore()
    const fileStore = useFilesStore()

    async function init() {
        const congname = congStore.congregation.name
        const lang = congStore.congregation.lang
        const classId = congStore.congregation.classId

        if (!congname || (!lang && !classId)) {
            welcomePage.value = true
        } else {
            welcomePage.value = false
            mwbTemplate.value = true
        }

        return !welcomePage.value
    }

    async function exitWelcome() {
        welcomePage.value = false
        mwbTemplate.value = true
        await visitStore.loadLocal();
        await eventStore.loadLocal();
        await fileStore.loadFiles();
        await fileStore.loadMonthTemplate();
    }

    return {
        welcomePage, mwbTemplate,
        pubsDispayPage,
        init, exitWelcome
    }
})