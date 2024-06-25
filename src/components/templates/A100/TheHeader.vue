<template>
    <div class="header">
        <div class="mwb-thumbnail">
            <img v-show="hasThumbnail" :src="loadThumbnail" alt="">
        </div>
        <div class="details">
            <div class="detail-congname">
                <input type="text" placeholder="Provide your congregation here! " v-model="congStore.congregation.name">
            </div>
            <div class="details-title" :style="bg">{{ titleDisplay }}</div>
            <div class="details-month" v-if="true">
                <div id="active-month">{{ monthDisplay }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useCongregationStore } from '@/stores/congregation'
    import { useFilesStore } from '@/stores/files';
    import { computed } from 'vue';

    const congStore = useCongregationStore()
    const fileStore = useFilesStore()

    const hasThumbnail = computed<boolean>(() => {
        return loadThumbnail.value !== ''
    })

    const loadThumbnail = computed<string>(() => {
        if (!fileStore.loadedMonth) return ''
        const thumbnail = fileStore.loadedMonth.content.thumbnail
        return thumbnail ?? ''
    })

    const monthDisplay = computed<string>(() => {
        return (!fileStore.loadedMonth) ? '' : fileStore.loadedMonth.content.display
    })

    const titleDisplay = computed<string>(() => {
        return (!fileStore.loadedMonth) ? '' : fileStore.loadedMonth.content.title
    })

    const bg = computed<{ color: string } | null>(() => {
        if (!fileStore.loadedMonth) return null
        return { color: fileStore.loadedMonth.content.theme }
    })

</script>