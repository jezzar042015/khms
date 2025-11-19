<template>
    <section>
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
                    <PartItem :part="part" :isLiving="true" :hasInsert="hasInsertedPart"
                        @insert-item="insertLivingPartItem" @remove-item="removeLivingPartItem" />
                </template>
                <template v-if="viewStore.cams">
                    <TechAssignments :weekId="w.id" />
                </template>
            </div>
        </div>
    </section>
    <div v-if="isFourthWeek" :class="pagebreaker"></div>
</template>

<script setup lang="ts">

    import { computed } from 'vue';
    import { useViewStore } from '@/stores/views';
    import { useFilesStore } from '@/stores/files';
    import type { PartItem as PartItemType, WeekItem } from '@/types/files';
    import WeekHeader from './WeekHeader.vue';
    import PartItem from './PartItem.vue'
    import TechAssignments from './TechAssignments.vue'

    const { w, i, weeks } = defineProps<{
        w: WeekItem
        i: number,
        weeks: number,
    }>()

    const fileStore = useFilesStore()

    const insertLivingPartItem = async (id: string) => {
        await fileStore.insertLivingItem(id)
    }

    const removeLivingPartItem = async (id: string) => {
        await fileStore.removeLivingItem(id)
    }

    const hasInsertedPart = computed(() => {
        const p = w.parts.living.find(i => i.id.endsWith('.nsrt'))
        return Boolean(p)
    })

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