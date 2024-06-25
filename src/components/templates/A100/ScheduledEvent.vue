<template>
    <div class="event-main">
        <div class="top-bar" :style="barBg"></div>
        <div class="event-holder" :style="bottomBorder">
            <div class="thumbnail">
                <img src="https://cms-imgp.jw-cdn.org/img/p/jwbkm/201504/univ/art/jwbkm_univ_201504_lss_01_lg.jpg"
                    alt="">
            </div>
            <div class="event-details">
                <div class="event-week">{{ weekDisplay }} | {{ weekEventName }} Week </div>
                <div class="event-name">{{ eventName }}</div>
                <div class="event-theme" :style="color"> {{ eventStore.loadDetail?.theme }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

    import { computed } from 'vue';
    import { useEventStore } from '@/stores/events';
    import { useFilesStore } from '@/stores/files';

    const eventStore = useEventStore()
    const fileStore = useFilesStore()

    const barBg = computed<{ background: string } | null>(() => {
        if (!fileStore.loadedMonth) return null
        return { background: fileStore.loadedMonth.content.theme }
    })

    const eventName = computed<string | null>(() => {
        if (!eventStore.loadDetail) return null
        const code = eventStore.loadDetail.code
        const event = eventStore.options.find(c => c.code == code)
        return !event ? null : event.name
    })

    const weekDisplay = computed<string | null>(() => {
        if (!fileStore.loadedMonth) return null
        const weekId = eventStore.loadDetail?.weekId
        if (!weekId) return null
        const week = fileStore.loadedMonth.content.weeks.find(w => w.id == weekId)
        if (!week) return null
        return week.week
    })

    const bottomBorder = computed<{ borderBottom: string } | null>(() => {
        if (!fileStore.loadedMonth) return null
        return { borderBottom: `4px solid ${fileStore.loadedMonth.content.theme}` }
    })

    const color = computed<{ color: string } | null>(() => {
        if (!fileStore.loadedMonth) return null
        return { color: fileStore.loadedMonth.content.theme }
    })

    const weekEventName = computed(() => {
        const code = eventStore.loadDetail?.code
        return code == 'rc' ? 'Convention' : 'Assembly'
    })
</script>

<style scoped>
    .event-main
    {
        grid-column: span 3;
    }

    .top-bar
    {
        display: flex;
        height: 15px;
    }

    .event-holder
    {
        display: grid;
        grid-template-columns: 200px 1fr;
        align-items: center;
        padding: 35px 25px;
        gap: 20px;
    }

    .thumbnail
    {
        width: 100%;
    }

    .thumbnail img
    {
        width: 100%;
        filter: brightness(110%);

    }

    .event-details
    {
        display: flex;
        flex-direction: column;
        margin: 0;
        padding: 0;
        line-height: 1.4;
    }

    .event-name
    {
        font-size: large;
        font-weight: 600;
        color: rgb(83, 83, 83)
    }

    .event-theme
    {
        font-size: 26px;
        font-weight: 600;
        color: #a66340;
    }
</style>