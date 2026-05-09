<template>
    <div :class="gridColumns" v-if="canDisplay">
        <div :class="part.classNames">{{ part.title }}</div>
        <div></div>
    </div>
</template>

<script setup lang="ts">
    import { useViewStore } from '@/stores/views';
    import type { S140PartItem } from '@/types/files';
    import { computed } from 'vue';

    const { part, gridColumns } = defineProps<{
        part: S140PartItem
        gridColumns: string
    }>()

    const viewStore = useViewStore()

    const canDisplay = computed(() => {
        if (viewStore.currentDisplayFilter == 'ta' && part.id.endsWith('h-gems')) return true
        if (viewStore.currentDisplayFilter == 'sa' && part.id.endsWith('h-ministry')) return true
        if (viewStore.currentDisplayFilter == 'lc' && part.id.endsWith('h-living')) return true
        if (viewStore.currentDisplayFilter == '**') return true
        return false
    })
</script>