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
                <template v-for="part in w.parts.living" :key="part.id">
                    <PartItem :part="part" />
                </template>
                <template v-if="viewStore.cams">
                    <TechAssignments :weekId="w.id" />
                </template>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">

    import type { WeekItem } from '@/types/files';
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