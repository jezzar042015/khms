<template>
    <div class="main">
        <div class="grid">
            <div class="icons">
                <IconVideoCam />
            </div>

            <div class="assignee" @click="showCamOpSelector">
                <div :class="camOpClasses">{{ displayCamOpAssignee }}</div>
                <AssignmentSelector v-if="camOpSelector" :part="cameraOp" :triggered="triggered"
                    @hide="hideCamOpSelector" @trigger-off="triggerOff" />
            </div>
        </div>
        <div class="grid">
            <div class="icons">
                <IconInterpreter />
            </div>
            <div class="assignee" @click="showInterpreterSelector">
                <div :class="interpretersClasses"> {{ displayInterpreterAssignee }}</div>
                <AssignmentSelector v-if="interpreterSelector" :part="interpreters" :triggered="triggered"
                    @hide="hideIntrepreterSelector" @trigger-off="triggerOff" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { PartItem } from '@/types/files';
    import { computed, ref } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import { usePublisherStore } from '@/stores/publisher';
    import IconVideoCam from '@/components/icons/IconVideoCam.vue';
    import IconInterpreter from '@/components/icons/IconInterpreter.vue';
    import AssignmentSelector from '@/components/AssignmentSelector.vue';

    const { weekId } = defineProps<{
        weekId: string
    }>()

    const assignmentStore = useAssignmentStore()
    const pubStore = usePublisherStore()
    const camOpSelector = ref(false);
    const interpreterSelector = ref(false);
    const triggered = ref(false);


    const cameraOp = ref<PartItem>({
        id: `${weekId}.cam`,
        time: 0,
        roles: ['cam'],
    })

    const interpreters = ref<PartItem>({
        id: `${weekId}.intr`,
        time: 0,
        roles: ['intr'],
        title: 'Reverse Interpreting'
    })

    const displayCamOpAssignee = computed(() => {
        const partid: string = cameraOp.value.id
        const assigned = assignmentStore.get.find(a => a.pid == partid);
        if (!assigned) return 'Not Assigned!'

        if (typeof assigned.a === 'string') {
            const pub = pubStore.publishers.find(p => p.id == (assigned?.a));
            return pub?.name || 'Not Assigned!';
        }
        return 'Not Assigned!'
    })

    const displayInterpreterAssignee = computed(() => {
        const partid: string = interpreters.value.id
        const assigned = assignmentStore.get.find(a => a.pid == partid);

        if (!assigned) return 'Not Assigned!'

        const p = [];
        const pub1 = pubStore.publishers.find(p => p.id == (assigned.a[0]));
        const pub2 = pubStore.publishers.find(p => p.id == (assigned.a[1]));
        if (pub1) p.push(pub1.name);
        if (pub2) p.push(pub2.name);
        return p.length > 0 ? p.join(' & ') : 'Not Assigned!';
    })

    const camOpClasses = computed(() => {
        return [
            'assign-to',
            { 'faded': displayCamOpAssignee.value == 'Not Assigned!' }
        ]
    })

    const interpretersClasses = computed(() => {
        return [
            'assign-to',
            { 'faded': displayInterpreterAssignee.value == 'Not Assigned!' }
        ]
    })

    function showCamOpSelector(): void {
        triggered.value = true
        if (interpreterSelector.value) interpreterSelector.value = false
        camOpSelector.value = true
    }

    function hideCamOpSelector(): void {
        camOpSelector.value = false
    }

    function showInterpreterSelector(): void {
        triggered.value = true
        if (camOpSelector.value) camOpSelector.value = false
        interpreterSelector.value = true
    }

    function hideIntrepreterSelector(): void {
        interpreterSelector.value = false
    }

    function triggerOff(): void {
        triggered.value = false
    }
</script>

<style scoped>
    .main
    {
        display: flex;
        flex-direction: column;
        height: auto;
        width: 100%;
        gap: 4px;
        padding-top: 5px;
        border-top: 1px dotted rgb(214, 214, 214);
        overflow: visible;
        position: relative;
    }

    .grid
    {
        display: grid;
        grid-template-columns: 38% 1fr
    }

    .icons
    {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 3px 15px;

    }

    .icons svg
    {
        height: 20px;
        width: 20px;
        opacity: .7;
    }
</style>