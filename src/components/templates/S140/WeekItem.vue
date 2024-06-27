<template>
    <div class="s140-week">
        <div :class="gridColumns">
            <div class="s140-week-title">{{ week }} | {{ reading }}</div>
        </div>

        <template v-for="part in composedParts" :key="part.id">
            <template v-if="part.type == 'header'">
                <div :class="gridColumns">
                    <div :class="part.classNames">{{ part.title }}</div>
                    <div></div>
                </div>
            </template>
            <template v-else>
                <PartItem :part="part" />
            </template>
        </template>

        <div class="s140-yspacer no-print"></div>
        <div class="s140-yspacer no-print"></div>
        <div class="s140-yspacer no-print"></div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';
    import { useFilesStore } from '@/stores/files';
    import { useCongregationStore } from '@/stores/congregation';
    import type { S140PartItem, WeekItemFeed } from '@/types/files';
    import PartItem from './PartItem.vue';

    interface S140Week {
        w: WeekItemFeed
        i: number
    }

    const props = defineProps<S140Week>()
    const congStore = useCongregationStore()
    const fileStore = useFilesStore()

    const week = computed(() => {
        if (!props.w) return null
        return props.w.week
    })

    const gridColumns = computed<string>(() => {
        const minClasses = congStore.congregation.classId;

        if (minClasses == 1) {
            return 's140-grid-col2'
        } else if (minClasses == 2) {
            return 's140-grid-col3'
        } else {
            return ''
        }
    });

    const reading = computed(() => {
        if (!props.w) return null
        return props.w.bibleReading
    })

    const composedParts = computed<S140PartItem[]>(() => {
        if (!props.w) return []
        const weekId = props.w.id;
        return fileStore.s140PartItems[weekId]
    })

</script>