<template>
    <div id="s140">
        <div>
            <template v-for="(w, i) in weeks" :key="w.id">
                <HeaderTitle v-if="i % 2 == 0" />
                <WeekItem :w="w" :i="i" v-if="!w.hasEvent" />
                <EventPlaceholder v-else />
                <div v-if="i % 2 == 1 && weeks.length > i + 1" class="page-break relative">
                    <div class="s140-break no-print"></div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useFilesStore } from '@/stores/files';
    import type { WeekItemFeed } from '@/types/files';
    import HeaderTitle from '@/components/templates/S140/HeaderTitle.vue';
    import WeekItem from '@/components/templates/S140/WeekItem.vue';
    import EventPlaceholder from './EventPlaceholder.vue';

    const fileStore = useFilesStore()

    const weeks = computed((): WeekItemFeed[] => {
        if (!fileStore.loadedMonth) return []
        return fileStore.loadedMonth.content.weeks.map(week => ({
            id: week.id,
            week: week.week,
            bibleReading: week.bibleReading,
            hasEvent: week.hasEvent
        }));
    });
</script>