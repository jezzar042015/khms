<template>
    <div class="main">
        <div class="grid">
            <div class="icons">
                <IconVideoCam />
            </div>

            <div class="assignee" @click="showSelector($event, 'cam')">
                <div :class="camOpClasses">{{ displayCamOpAssignee }}</div>
            </div>
        </div>
        <div class="grid">
            <div class="icons">
                <IconInterpreter />
            </div>
            <div class="assignee" @click="showSelector($event, 'int')">
                <div :class="interpretersClasses"> {{ displayInterpreterAssignee }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { PartItem } from '@/types/files';
    import { computed, ref } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import { useAssignmentSelector } from '@/stores/assignment-selector';
    import { usePublisherStore } from '@/stores/publisher';
    import IconVideoCam from '@/components/icons/IconVideoCam.vue';
    import IconInterpreter from '@/components/icons/IconInterpreter.vue';

    const { weekId } = defineProps<{
        weekId: string
    }>()

    const assignmentStore = useAssignmentStore()
    const pubStore = usePublisherStore()
    const selector = useAssignmentSelector()

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

    const camOpAssigned = computed(() => {
        const partid: string = cameraOp.value.id
        return assignmentStore.get.find(a => a.pid == partid);
    })

    const interpretersAssigned = computed(() => {
        const partid: string = interpreters.value.id
        return assignmentStore.get.find(a => a.pid == partid);
    })

    const displayCamOpAssignee = computed(() => {
        if (!camOpAssigned.value) return 'Not Assigned!'

        if (typeof camOpAssigned.value.a === 'string') {
            const pub = pubStore.publishers.find(p => p.id == (camOpAssigned.value?.a));
            return pub?.name || 'Not Assigned!';
        }
        return 'Not Assigned!'
    })

    const displayInterpreterAssignee = computed(() => {

        if (!interpretersAssigned.value) return 'Not Assigned!'

        const p = [];
        const pub1 = pubStore.publishers.find(p => p.id == (interpretersAssigned.value?.a[0]));
        const pub2 = pubStore.publishers.find(p => p.id == (interpretersAssigned.value?.a[1]));
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

    function showSelector(e: MouseEvent, tech: 'cam' | 'int'): void {
        const target = e.currentTarget as HTMLElement | null
        if (!target) return

        const rect = target.getBoundingClientRect();
        const part = tech === 'cam' ? cameraOp.value : interpreters.value
        selector.setTargetRect(rect, part)
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