<template>
    <div class="main">
        <div class="grid">
            <div class="icons">
                <IconVideoCam />
            </div>

            <div class="assignee" @click="showSelector">
                <div class="assign-to faded">Not Assigned!</div>
                <AssignmentSelector v-if="selector" :part="cameraOp" :triggered="triggered" @hide="hideSelector"
                    @trigger-off="triggerOff" />
            </div>
        </div>
        <div class="grid">
            <div class="icons">
                <IconInterpreter />
            </div>
            <div class="assignee" @click="showSelector">
                <div class="assign-to faded">Not Assigned!</div>
                <AssignmentSelector v-if="selector" :part="interpreters" :triggered="triggered" @hide="hideSelector"
                    @trigger-off="triggerOff" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref } from 'vue';
    import type { PartItem } from '@/types/files';
    import IconVideoCam from '@/components/icons/IconVideoCam.vue';
    import IconInterpreter from '@/components/icons/IconInterpreter.vue';
    import AssignmentSelector from '@/components/AssignmentSelector.vue';

    const selector = ref(false)
    const triggered = ref(false)

    const cameraOp = ref<PartItem>({
        id: '.p-cam',
        time: 0,
        roles: [],
    })

    const interpreters = ref<PartItem>({
        id: '.p-ints',
        time: 0,
        roles: [],
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
    .main
    {
        display: flex;
        flex-direction: column;
        height: auto;
        width: 100%;
        gap: 4px;
        padding-top: 5px;
        border-top: 1px dotted rgb(214, 214, 214);
    }

    .grid
    {
        display: grid;
        grid-template-columns: 33% 1fr
    }

    .icons
    {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        padding: 3px;

    }

    .icons svg
    {
        height: 20px;
        width: 20px;
        opacity: .7;
    }

    .assignee
    {
        display: flex;
        padding-left: 16px;
        align-items: center
    }

</style>