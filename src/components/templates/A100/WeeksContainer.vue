<template>
    <div class="contents">
        <template v-for="(w, i) in weeks" :key="w.id">
            <ScheduledEvent v-if="w.hasEvent" />
            <ScheduleByWeek :w="w" :i="i" :weeks="weeksCount" v-else />
        </template>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useFilesStore } from '@/stores/files';
    import type { WeekItem } from '@/types/files';

    import ScheduleByWeek from '@/components/templates/A100/ScheduleByWeek.vue'
    import ScheduledEvent from '@/components/templates/A100/ScheduledEvent.vue'

    const fileStore = useFilesStore()

    const weeks = computed<WeekItem[]>(() => {
        if (!fileStore.loadedMonth) return []
        return fileStore.loadedMonth.content.weeks;
    });

    const weeksCount = computed<number>(() => {
        if (!fileStore.loadedMonth) return 0
        return fileStore.loadedMonth.content.weeks.length
    })
</script>