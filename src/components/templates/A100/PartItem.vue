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
            <div class="assignee" @click="showSelector">
                <div :class="assignClasses">{{ displayAssignee }}</div>
                <AssignmentSelector v-if="selector" :part="partItem" :triggered="triggered" @hide="hideSelector"
                    @trigger-off="triggerOff" />
            </div>
        </span>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import { usePublisherStore } from '@/stores/publisher';
    import type { PartItem } from '@/types/files';

    import thumbnails from '@/assets/utils/thumbnails';
    import AssignmentSelector from '@/components/AssignmentSelector.vue';


    const props = defineProps<{
        part: PartItem
    }>()

    const partItem = ref<PartItem>(
        { ...props.part }
    )

    const selector = ref(false)
    const triggered = ref(false)

    const assignmentStore = useAssignmentStore();
    const pubStore = usePublisherStore()

    const isDemo = computed(() => props.part.roles?.includes('demo'))
    const isBibleReading = computed(() => props.part.roles?.includes('br'))
    const isTalk = computed(() => props.part.roles?.includes('talk'))

    const displayAssignee = computed(() => {
        if (props.part?.isVisit) return props.part.co

        const partid: string = props.part?.id ?? ''
        const assigned = assignmentStore.get.find(a => a.pid == partid);
        if (!assigned) return 'Not Assigned!'

        if (typeof assigned.a === 'string') {
            const pub = pubStore.publishers.find(p => p.id == (assigned?.a));
            return pub?.name || 'Not Assigned!';

        } else if (isDemo.value) {
            const p = [];
            const pub1 = pubStore.publishers.find(p => p.id == (assigned.a[0]));
            const pub2 = pubStore.publishers.find(p => p.id == (assigned.a[1]));
            if (pub1) p.push(pub1.name);
            if (pub2) p.push(pub2.name);
            return p.length > 0 ? p.join(' & ') : 'Not Assigned!';

        } else if (isTalk.value || isBibleReading.value) {
            const pub = pubStore.publishers.find(p => p.id == (assigned.a[0]));
            return pub ? pub.name : ''

        } else {
            return null;
        }
    })

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

    const itemClasses = computed<string>(() => {
        if (props.part.class == 'accessory')
            return 'accessory'
        return 'part-item'
    })

    function showSelector(): void {
        triggered.value = true
        selector.value = true
    }

    function hideSelector(): void {
        selector.value = false
    }

    function triggerOff(): void {
        triggered.value = false
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