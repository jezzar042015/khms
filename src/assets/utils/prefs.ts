import { useViewStore } from "@/stores/views";

export const prefs = {
    async read() {
        const params = readParams();
        const cams = params.get('cams')
        const audience = params.get('aud')
        await setCams(cams);
        await setAudience(audience);
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

async function setAudience(audienceMode: string | null) {
    if (!audienceMode) return

    let mode = false;
    if (audienceMode === 'on') mode = true;
    if (audienceMode === 'off') mode = false;
    const viewStore = useViewStore()

    viewStore.audience = mode
    localStorage.setItem('khmsts-prefs-aud', Number(mode).toString())
}