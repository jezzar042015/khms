<template>
    <div class="s140-week">
        <div :class="gridColumns">
            <div class="s140-week-title">{{ week }} | {{ reading }}</div>
            <div v-show="hasAuxClass" class="classrooms">
                <span class="classlabel" v-show="hasMeetingDemos">Auxillary Class</span>
            </div>
            <div class="classrooms">
                <span class="classlabel" v-show="hasAuxClass">Main Hall</span>
            </div>
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

    const hasAuxClass = computed<boolean>(() => {
        return congStore.congregation.classId == 2
    })

    const hasMeetingDemos = computed<boolean>(() => {
        const weekId = props.w.id
        if (!weekId) return false
        const weekParts = fileStore.s140PartItems[weekId]
        if (!weekParts) return false
        const demoParts = weekParts.some(p => p.roles?.includes('demo'))
        return demoParts
    })

    const gridColumns = computed<string>(() => {
        if (!hasAuxClass.value) {
            return 's140-grid-col2'
        } else if (hasAuxClass.value) {
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

<style scoped>
    .classrooms
    {
        text-align: left;
        font-size: .8em;
        font-weight: 600;
        text-transform: uppercase;
        display: flex;
        align-items: center;
    }

    .classlabel
    {
        padding: 0px 10px 2.5px;
        min-width: 80%;
        border-bottom: 2px solid grey
    }
</style>