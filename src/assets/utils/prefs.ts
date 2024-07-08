import { useViewStore } from "@/stores/views";

export const prefs = {
    async read() {
        const params = readParams();
        const cams = params.get('cams')
        await setCams(cams);
    }
}

function readParams() {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.search)
    return params;
}

async function setCams(camsMode: string | null) {
    if (!camsMode) return

    let mode = false;
    if (camsMode === 'on') mode = true;
    if (camsMode === 'off') mode = false;
    const viewStore = useViewStore()

    viewStore.cams = mode
    localStorage.setItem('khmsts-prefs-cams', Number(mode).toString())
}