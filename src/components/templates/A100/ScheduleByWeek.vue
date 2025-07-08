<template>
    <section :class="pagebreaker">
        <WeekHeader :w="w" />
        <div class="assignments">
            <div>
                <template v-for="part in w.parts.gems" :key="part.id">
                    <PartItem :part="part" />
                </template>
            </div>
            <div>
                <template v-for="part in w.parts.ministry" :key="part.id">
                    <PartItem :part="part" />
                </template>
            </div>
            <div>
                <template v-for="part in livingParts" :key="part.id">
                    <PartItem :part="part" :isLiving="true" />
                </template>
                <template v-if="viewStore.cams">
                    <TechAssignments :weekId="w.id" />
                </template>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">

    import type { PartItem as PartItemType, WeekItem } from '@/types/files';
    import { computed } from 'vue';
    import { useViewStore } from '@/stores/views';
    import WeekHeader from './WeekHeader.vue';
    import PartItem from './PartItem.vue'
    import TechAssignments from './TechAssignments.vue'

    const { w, i, weeks } = defineProps<{
        w: WeekItem
        i: number,
        weeks: number,
    }>()

    const livingParts = computed<PartItemType[]>(() => {
        const parts = [...w.parts.living]
        const isVisitWeek = w.parts.living[w.parts.living.length - 2].isVisit

        if (isVisitWeek) {
            parts[parts.length - 1] = { ...w.parts.living[w.parts.living.length - 2] }
            parts[parts.length - 2] = { ...w.parts.living[w.parts.living.length - 1] }
        }

        return parts
    })

    const viewStore = useViewStore()

    const isFourthWeek = computed<boolean>(() => {
        const isLastWeek = weeks == i + 1;
        if (isLastWeek) return false;
        return (i + 1) % 4 == 0;
    })

    const pagebreaker = computed<string>(() => {
        return isFourthWeek.value ? 'page-break' : '';
    })

</script>