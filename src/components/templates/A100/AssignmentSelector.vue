<template>
    <div class="assign-selector onleft" ref="assignSelector">
        <div class="wrapper">
            <div class="arrow arrow-right">

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { PartItem } from '@/types/files';
    import { onMounted, onUnmounted, ref } from 'vue';

    const emits = defineEmits(['hide', 'trigger-off'])
    const props = defineProps<{
        part: PartItem,
        triggered: boolean,
    }>()

    const mouseYpos = ref<number>()
    const assignSelector = ref<HTMLElement | null>(null)
    const arrow = ref<HTMLElement | null>(null)

    function blurredSelector(event: MouseEvent): void {
        if (props.triggered) {
            mouseYpos.value = event.clientY
            // setMyTransform()
            emits("trigger-off");
            return;
        }

        if (assignSelector.value && !assignSelector.value.contains(event.target as HTMLElement)) {
            emits('hide')
        }
    };

    onMounted(() => {
        // prepAssignment()
        // loadAssigned()
        document.addEventListener('click', blurredSelector);
    })

    onUnmounted(() => {
        document.removeEventListener('click', blurredSelector);
    })

</script>

<style scoped>
    .assign-selector
    {
        position: absolute;
        min-width: 325px;
        z-index: 1;
        width: auto;
        height: 250px;
        min-height: 100px;
        max-height: 400px;
        background: #ffff;
        box-shadow: rgba(0, 0, 0, 0.56) 0px 22px 70px 4px;
        padding: 15px 15px;
        overflow: visible;
        font-size: 15px;
        border-radius: 3px;
        transition: fade 2s;
    }

    .ontop
    {
        bottom: 30px;
        right: calc(0%);
    }

    .onbottom
    {
        top: 30px;
        right: calc(0%);
    }

    .onright
    {
        transform: translateX(30%) translateY(-50%);

    }

    .onleft
    {
        transform: translateX(-105%) translateY(-50%);

    }

    .wrapper
    {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
    }

    .arrow
    {
        position: absolute;
        background: #ffff;
        height: 20px;
        width: 20px;
        content: "";
        transform: rotate(45deg);
        z-index: -3;
    }

    .arrow-top
    {
        top: -23px;
    }

    .arrow-bottom
    {
        bottom: -23px;
    }

    .arrow-left
    {
        left: -25px;
        top: 42%;
    }

    .arrow-right
    {
        right: -24px;
        top: 41%;
    }
</style>