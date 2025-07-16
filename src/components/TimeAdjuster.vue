<template>
    <div id="tc-wrapper" ref="timerAdjuster">
        <div>
            <span class="tc-label">Change time</span>
        </div>
        <div class="bar"></div>
        <div>
            <p class="tc-title">
                {{ partItem.title }}
            </p>
        </div>
        <div class="input">
            <label for="">{{ time }} minute{{ time == 1 ? '' : 's' }}</label>
            <div class="col-2">
                <input type="range" :min="1" :max="60" v-model="time">
                <button v-if="part.time != partItem.time" class="btn" @click="restore">
                    Restore to {{ part.time }}min
                </button>
            </div>
        </div>
        <div>

        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, useTemplateRef } from 'vue'
    import { onClickOutside } from '@vueuse/core'
    import type { PartItem } from '@/types/files';

    const { part, partItem } = defineProps<{
        part: PartItem
        partItem: PartItem
    }>()

    const emits = defineEmits(['close'])
    const timerAdjuster = useTemplateRef<HTMLElement>('timerAdjuster')
    onClickOutside(timerAdjuster, () => update())

    const time = ref(0)
    const update = () => {
        emits('close', time.value)
    }

    const restore = () => {
        emits('close', part.time)
    }

    onMounted(() => {
        time.value = partItem.time
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
        min-width: 280px;
        left: 25px;
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
        font-size: larger;
        color: black;
        font-weight: 600;
    }

    .col-2
    {
        display: block;
        justify-content: space-between;
        gap: 10px;
    }

    .btn
    {
        padding: 6px 20px;
        border: 1px #3DA8EA solid;
        background: #ffffff;
        color: #3DA8EA;
        border-radius: 4px;
        cursor: pointer;
        font-size: .70em;
        width: 100%;
    }


    /* Styling the range input */
    input[type="range"]
    {
        -webkit-appearance: none;
        /* Remove default WebKit styling */
        appearance: none;
        width: 100%;
        /* Full width */
        height: 5px;
        /* Track height */
        background: #e0e0e0;
        /* Track background */
        border-radius: 5px;
        /* Rounded track */
        outline: none;
        /* Remove focus outline */
        transition: background 0.3s ease;
        /* Smooth background transition */
        margin: 20px 0;
        cursor: pointer;
    }

    /* Track styling for WebKit browsers (Chrome, Safari) */
    input[type="range"]::-webkit-slider-runnable-track
    {
        height: 8px;
        background: #e0e0e0;
        border-radius: 5px;
    }

    /* Thumb styling for WebKit browsers */
    input[type="range"]::-webkit-slider-thumb
    {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        /* Thumb size */
        height: 20px;
        background: #3DA8EA;
        /* Thumb color */
        border-radius: 50%;
        /* Circular thumb */
        cursor: pointer;
        margin-top: -5px;
        /* Align thumb with track */
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
        /* Thumb shadow */
    }

    /* Track styling for Firefox */
    input[type="range"]::-moz-range-track
    {
        height: 10px;
        background: #e0e0e0;
        border-radius: 5px;
    }

    /* Thumb styling for Firefox */
    input[type="range"]::-moz-range-thumb
    {
        width: 20px;
        height: 20px;
        background: #3DA8EA;
        border-radius: 50%;
        cursor: pointer;
        border: none;
        /* Remove default border */
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }

    /* Track styling for Microsoft Edge */
    input[type="range"]::-ms-track
    {
        height: 10px;
        background: #e0e0e0;
        border-radius: 5px;
        color: transparent;
        /* Hide default tick marks */
    }

    /* Thumb styling for Microsoft Edge */
    input[type="range"]::-ms-thumb
    {
        width: 20px;
        height: 20px;
        background: #3DA8EA;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
    }

    /* Styling on hover or focus */
    input[type="range"]:hover::-webkit-slider-thumb,
    input[type="range"]:focus::-webkit-slider-thumb
    {
        background: #1f9ce9;
        /* Darker thumb color on hover/focus */
    }

    input[type="range"]:hover::-moz-range-thumb,
    input[type="range"]:focus::-moz-range-thumb
    {
        background: #1f9ce9;
    }

    input[type="range"]:hover::-ms-thumb,
    input[type="range"]:focus::-ms-thumb
    {
        background: #1f9ce9;
    }

</style>