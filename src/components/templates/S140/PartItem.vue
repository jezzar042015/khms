<template>
    <div class="s140-grid-col2 s140-part-item">
        <div class="s140-grid-titles">
            <span v-show="part?.time" class="s140-runtime">{{ runTime }}</span>
            <span v-show="part?.time">{{ part?.title }} {{ timeLimit }}</span>
        </div>
        <div class="assignee" v-show="canSelectPerson" @click.stop="showSelector">
            <div :class="assignClasses">
                <span class="s140-part-label" v-show="part?.label">{{ part?.label }}:</span>
                {{ displayAssignee }}
            </div>
            <!-- <PublisherSelector v-if="selector.show" :part="part" :me="selector" :assignee="partAssignedTo" /> -->
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAssignmentStore } from '@/stores/assignment';
    import { computed, ref } from 'vue';
    import { useCongregationStore } from '@/stores/congregation';
    import type { S140PartItem } from '@/types/files';
    // import PublisherSelector from '../template-psp/PublisherSelector.vue';


    const assignmentStore = useAssignmentStore();
    const congStore = useCongregationStore();

    const props = defineProps<{
        part: S140PartItem
    }>()

    const selector = ref({
        show: false
    })

    const displayAssignee = computed(() => {
        if (!props.part?.isVisit) {
            // const partid = props.part?.id
            // const assigned = assignmentStore.get[partid];
            const assigned = ''
            return assigned || 'Not Assigned!';
        } else {
            return props.part.co
        }
    })

    const canSelectPerson = computed(() => {
        return props.part.roles ?? [].length > 0
    })

    const assignClasses = computed(() => {
        return [
            's140-person', 'relative',
            { 'faded': displayAssignee.value == 'Not Assigned!' }
        ]
    })

    const timeLimit = computed(() => {
        if (!props.part?.time) return null
        if (props.part.showNoTime) return null
        return `(${props.part.time} min.)`
    })

    const runTime = computed<string | null>(() => {
        if (!props.part.runtime) return null
        const startTime = congStore.congregation.midweekTime ?? '06:00'
        return displayTime(startTime, props.part?.runtime)
    })

    function showSelector() {
        selector.value.show = true
    }

    function displayTime(startingTime: string, minutesToAdd: number) {
        const [startHours, startMinutes] = startingTime.split(':').map(Number);
        let totalMinutes = startHours * 60 + startMinutes + minutesToAdd;
        let newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;

        if (newHours === 0) {
            newHours = 12;
        } else if (newHours > 12) {
            newHours -= 12;
        }

        const formattedHours = newHours.toString().padStart(2, '0');
        const formattedMinutes = newMinutes.toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`;
    }


</script>