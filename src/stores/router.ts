import { defineStore } from "pinia";
import { useFilesStore } from "./files";
import { ref, watch } from "vue";
import { useCongregationStore } from "./congregation";

export const useRouterStore = defineStore('router', () => {

    const fileStore = useFilesStore()
    const congStore = useCongregationStore()
    const searchParams = ref<URLSearchParams | null>(null)

    const pruneParams = () => {
        const { pathname, origin } = window.location;
        history.replaceState(null, '', `${origin}${pathname}`);
    }

    const addSearchParams = (search: string) => {
        if (!search) return;

        const { origin, pathname, search: currentSearch } = window.location;

        const params = new URLSearchParams(currentSearch);
        const newParams = new URLSearchParams(search);

        newParams.forEach((value, key) => {
            params.set(key, value);
        });

        searchParams.value = params

        history.replaceState(null, '', `${origin}${pathname}?${params.toString()}`);
    }

    const loadParams = () => {
        const { search: currentSearch } = window.location;
        const params = new URLSearchParams(currentSearch);
        searchParams.value = params
    }

    watch(
        () => searchParams.value,
        () => {
            const requestMonth = searchParams.value?.get('month');
            const requestLang = searchParams.value?.get('lang');
            const requestCong = searchParams.value?.get('cong');

            if (requestLang)
                congStore.congregation.lang = requestLang

            if (requestMonth)
                fileStore.currentPeriod = requestMonth

            if (requestCong)
                if (requestCong.trim() || !congStore.congregation.name)
                    congStore.congregation.name = requestCong

        })

    return {
        pruneParams,
        addSearchParams,
        loadParams
    }
})