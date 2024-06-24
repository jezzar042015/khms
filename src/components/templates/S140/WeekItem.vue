<template>
    <div class="s140-week">
        <div class="s140-grid-col2">
            <div class="s140-week-title">{{ week }} | {{ reading }}</div>
        </div>

        <template v-for="part in composedParts" :key="part.id">
            <template v-if="part.type == 'header'">
                <div class="s140-grid-col2">
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
    import PartItem from './PartItem.vue';

    const props = defineProps({
        w: Object,
        i: Number,
    })

    const fileStore = useFilesStore()

    const week = computed(() => {
        if (!props.w) return null
        return props.w.week
    })

    const reading = computed(() => {
        if (!props.w) return null
        return props.w.bibleReading
    })

    const composedParts = computed(() => {
        if (!props.w) return []
        const weekId = props.w.id;
        return fileStore.s140PartItems[weekId]
    })

</script>