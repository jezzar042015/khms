<template>
    <div :class="itemClasses">
        <span>{{ time }}</span>
        <span v-if="part.thumbnail">
            <div class="part-thumbnail">
                <img :src="thumbnail ?? ''" alt="">
            </div>
        </span>
        <span v-else class="thumbnail-alt">{{ part.alt }}</span>

        <span>
            <div v-show="part.title" :class="part.class">{{ part.title }}</div>
            <div class="generic-label">{{ part.reference }}</div>
            <div class="assignee" @click.stop="showSelector">
                <div :class="assignClasses">{{ displayAssignee }}</div>
                <!-- <PublisherSelector v-if="selector.show" :part="p" :me="selector" :assignee="partAssignedTo" /> -->
            </div>
        </span>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import type { PartItem } from '@/types/files';
    import thumbnails from '@/assets/utils/thumbnails';
    // // import PublisherSelector from '@/components/templates/template-psp/PublisherSelector.vue'

    const props = defineProps<{
        part: PartItem
    }>()

    // const assignmentStore = useAssignmentsStore();

    const displayAssignee = computed(() => {
        if (!props.part.isVisit) {
            // const partid = props.part.id
            // const assigned = assignmentStore.getAssignments[partid];
            // return assigned ?? 'Not Assigned!';
            return 'Not Assigned!';
        } else {
            return props.part.co
        }
    })

    // const partAssignedTo = computed(() => {
    //     const partid = props.p.id
    //     const assigned = assignmentStore.getAssignments[partid];
    //     return assigned
    // })

    const assignClasses = computed(() => {
        return [
            'assign-to',
            { 'faded': displayAssignee.value == 'Not Assigned!' }
        ]
    })

    const thumbnail = computed<string | null>(() => {
        if (!props.part.thumbnail) return null
        const tn = thumbnails[props.part.thumbnail]
        return (tn) ? tn.thumbnail : props.part.thumbnail
    });

    const time = computed<string | null>(() => {
        if (!props.part.time) return null
        return `${props.part.time}m`
    })

    const selector = ref({
        show: false
    })

    const itemClasses = computed<string>(() => {
        if (props.part.class == 'accessory')
            return 'accessory'
        return 'part-item'
    })

    function showSelector() {
        selector.value.show = true
    }

</script>

<style scoped>
    .accessory
    {
        display: grid;
        grid-template-columns: 2fr 4fr 10fr;
        padding-bottom: 3px;
    }
</style>