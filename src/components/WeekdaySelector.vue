<template>
    <div class="weekday-selector">
        <div class="wrapper">
            <span class="close" @click.stop="emits('hide-selector')">&times;</span>
            <div class="header">Midweek Meeting Day</div>
            <div class="days">
                <span :class="myClass(0)" @click="setDay(0)"> Mon </span>
                <span :class="myClass(1)" @click="setDay(1)"> Tue </span>
                <span :class="myClass(2)" @click="setDay(2)"> Wed </span>
                <span :class="myClass(3)" @click="setDay(3)"> Thu </span>
                <span :class="myClass(4)" @click="setDay(4)"> Fri </span>
                <span :class="myClass(5)" @click="setDay(5)"> Sat </span>
                <span :class="myClass(6)" @click="setDay(6)"> Sun </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useCongregationStore } from '@/stores/congregation';

    const congStore = useCongregationStore()
    const emits = defineEmits(["hide-selector"])
    const setDay = (num: number) => {
        congStore.congregation.midweekDay = num;
    }

    const myClass = ((num: number) => ({
        'day-option': true,
        active: congStore.congregation.midweekDay === num,
    }));
</script>

<style scoped>
    .weekday-selector
    {
        margin-top: 8px;
        background: white;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 4px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
        font-size: 16px;
        font-weight: 400;
        text-transform: none;
        padding: 1em;
        border-radius: 3px;
        min-width: 18em;
        color: black;
        z-index: 100;
    }

    .wrapper
    {
        position: relative;
    }

    .close
    {
        position: absolute;
        right: -.1em;
        top: -.5em;
        font-size: 1.3em;
        opacity: 80%;
    }

    .header
    {
        text-wrap: nowrap;
    }

    .days
    {
        display: flex;
        gap: 5px;
        padding-top: 1em;
    }

    .day-option
    {
        padding: .5em 1em;
        font-size: .75em;
        text-transform: uppercase;
        border-radius: 3px;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 1px 0px
    }

    .active
    {
        background-color: #3DA8EA;
        color: white;
        box-shadow: rgba(60, 64, 67, 0.3) 2px 3px 3px 0px
    }
</style>