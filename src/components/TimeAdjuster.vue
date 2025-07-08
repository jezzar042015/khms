<template>
    <div id="tc-wrapper" ref="timerAdjuster">
        <div>
            <span class="tc-label">Change time</span>
        </div>
        <div class="bar"></div>
        <div>
            <p class="tc-title">
                {{ part.title }}
            </p>
        </div>
        <div class="input">
            <label for="">Minutes</label>
            <input type="number" :min="1" :max="60" v-model="time">
        </div>
        <div>

        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, useTemplateRef } from 'vue'
    import { onClickOutside } from '@vueuse/core'
    import type { PartItem } from '@/types/files';

    const { part } = defineProps<{
        part: PartItem
    }>()

    const emits = defineEmits(['close'])
    const timerAdjuster = useTemplateRef<HTMLElement>('timerAdjuster')
    onClickOutside(timerAdjuster, () => update())

    const time = ref(0)
    const update = () => {
        emits('close', time.value)
    }

    onMounted(() => {
        time.value = part.time
    })
</script>

<style lang="css" scoped>
    #tc-wrapper
    {
        padding: 15px 20px;
        background: white;
        border-radius: 3px;
        transition: fade 1s;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
        position: absolute;
        z-index: 10;
        min-width: 300px;
        right: 50px;
        top: -40px;
        font-size: large;
    }

    .tc-label
    {
        font-size: smaller;
        color: #000;
    }

    .bar
    {
        margin-top: 5px;
        background-color: #3da8ea7a;
        height: 5px;
        width: 30%;
    }

    .tc-title
    {
        padding-top: 10px;
        font-size: medium;
        color: #000 !important;
    }

    .input
    {
        margin-top: 20px;
        display: flex;
        flex-direction: column;
    }

    .input label
    {
        font-size: small;
    }

    .input input
    {
        width: 60%;
        border: none;
        border-bottom: 1px solid gray;
        padding: 10px;
        border-radius: 2px;
        outline: none;
        font-size: x-large;

    }
</style>