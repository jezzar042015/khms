<template>
    <div class="s140-week">
        <div :class="gridColumns">
            <div class="s140-week-title">
                <span class="s140-week-date">
                    <span @click="showDaySelector">{{ midweekDate }}</span>
                    <WeekdaySelector v-if="onDaySelection" ref="daySelector" @hide-selector="hideDaySelector" />
                </span>
                <span> &nbsp;|&nbsp; </span>
                <span>{{ reading }}</span>
            </div>
            <div v-show="hasAuxClass" class="classrooms">
                <span class="classlabel" v-show="hasMeetingDemos">Auxillary Class</span>
            </div>
            <div class="classrooms">
                <span class="classlabel" v-show="hasAuxClass">Main Hall</span>
            </div>
        </div>

        <template v-for="part in composedParts" :key="part.id">
            <template v-if="part.type == 'header'">
                <MeetingSectionHeader :part :grid-columns="gridColumns" />
            </template>
            <template v-else>
                <PartItem :part="part" :key="part.id" :has-inserted="hasInserted" @insert-item="insertLivingPartItem"
                    @remove-item="removeLivingPartItem" />
            </template>
        </template>

        <div v-if="!isDisplayOnFilters" class="s140-yspacer no-print"></div>
        <div v-if="!isDisplayOnFilters" class="s140-yspacer no-print"></div>
        <div v-if="!isDisplayOnFilters" class="s140-yspacer no-print"></div>
    </div>
</template>

<script setup lang="ts">
    import type { S140PartItem, WeekItemFeed } from '@/types/files';
    import { computed, ref } from 'vue';
    import { useFilesStore } from '@/stores/files';
    import { useCongregationStore } from '@/stores/congregation';
    import { useWeeklyDate } from '@/composables/weeklyDate';
    import { onClickOutside } from '@vueuse/core'
    import PartItem from './PartItem.vue';
    import WeekdaySelector from '@/components/WeekdaySelector.vue';
    import MeetingSectionHeader from './MeetingSectionHeader.vue';
    import { useViewStore } from '@/stores/views';

    const { w, i } = defineProps<{
        w: WeekItemFeed
        i: number
    }>()
    const congStore = useCongregationStore()
    const fileStore = useFilesStore()
    const viewStore = useViewStore()

    const hasAuxClass = computed<boolean>(() => {
        return congStore.congregation.classId == 2
    })

    const midweekDate = computed(() => {
        if (!w.id) return ''
        return useWeeklyDate(w.id, w.week)
    })

    const isDisplayOnFilters = computed(()=> {
        return viewStore.currentDisplayFilter !== "**"
    })

    const hasMeetingDemos = computed<boolean>(() => {
        const weekId = w.id
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
        if (!w) return null
        return w.bibleReading
    })

    const composedParts = computed<S140PartItem[]>(() => {
        if (!w) return []
        const weekId = w.id;
        return fileStore.s140PartItems[weekId]
    })

    const hasInserted = computed(() => composedParts.value.some(s => s.id.endsWith('.nsrt')))

    // midweek day selector

    const onDaySelection = ref(false)
    const daySelector = ref(null)
    const showDaySelector = () => {
        onDaySelection.value = true
    }
    const hideDaySelector = () => {
        onDaySelection.value = false
    }

    const insertLivingPartItem = async (id: string) => {
        await fileStore.insertLivingItem(id)
        await fileStore.composeS140()
    }

    const removeLivingPartItem = async (id: string) => {
        await fileStore.removeLivingItem(id)
        await fileStore.composeS140()
    }

    onClickOutside(daySelector, event => hideDaySelector())
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