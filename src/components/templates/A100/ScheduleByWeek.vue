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
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">

    import { computed } from 'vue';
    import type { WeekItem } from '@/types/files';
    import WeekHeader from './WeekHeader.vue';
    import PartItem from './PartItem.vue'

    const props = defineProps<{
        w: WeekItem
        i: number,
        weeks: number,
    }>()

    const isFourthWeek = computed<boolean>(() => {
        const isLastWeek = props.weeks == props.i + 1;
        if (isLastWeek) return false;
        return (props.i + 1) % 4 == 0;
    })

    const pagebreaker = computed<string>(() => {
        return isFourthWeek.value ? 'page-break' : '';
    })

</script>