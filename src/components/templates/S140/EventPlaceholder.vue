<template>
    <div class="main">
        <div class="eventweek">{{ weekRange }} | {{ weekEventName }} Week</div>
        <div class="event-name">{{ eventName }}</div>
        <div class="event-theme">{{ eventTheme }}</div>
    </div>
</template>

<script setup lang="ts">
    import { useEventStore } from '@/stores/events';
    import { useFilesStore } from '@/stores/files';
    import { computed } from 'vue';

    const eventStore = useEventStore()
    const fileStore = useFilesStore()
    const weekEvent = eventStore.loadDetail

    const weekRange = computed(() => {
        if (!weekEvent) return null
        const weekid = weekEvent.weekId
        const week = fileStore.weekOptions.find(w => w.id == weekid)
        return week?.name
    })

    const eventName = computed(() => {
        if (!weekEvent) return null
        const code = weekEvent.code
        const event = eventStore.options.find(e => e.code == code)
        return event?.name
    })

    const eventTheme = computed(() => {
        if (!weekEvent) return null
        return weekEvent.theme
    })

    const weekEventName = computed(() => {
        if (!weekEvent) return null
        const code = weekEvent.code
        return code == 'rc' ? 'Convention' : 'Assembly'
    })

</script>

<style scoped>
    .main
    {
        padding: 80px 40px;
        border: 1px solid oldlace;
        margin: 80px 10px;
        border-left: 20px solid oldlace;
    }

    .eventweek
    {
        font-size: 1.2em;
    }

    .event-name
    {
        font-size: 1.8em;
        font-weight: 600;
        color: gray;
    }

    .event-theme
    {
        font-size: 2.3em;
        font-weight: 700;
        color: gray;
    }
</style>