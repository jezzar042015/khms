<template>
    <div class="custom-switch">
        <label :for="id">
            <input type="checkbox" :id="id" :checked="modelValue === trueValue" @change="toggleSwitch" />
            <span :class="['slider']"></span>
            <span class="label-text">{{ label }}</span>
        </label>
    </div>
</template>

<script setup lang="ts">

    const props = defineProps({
        modelValue: {
            type: [String, Boolean],
            required: true
        },
        label: {
            type: String,
            default: ""
        },
        falseValue: {
            type: [String, Boolean],
            default: false
        },
        trueValue: {
            type: [String, Boolean],
            default: true
        },
        id: {
            type: String,
            default: () => `switch-${Math.random().toString(36).substr(2, 9)}`
        }
    });

    const emit = defineEmits(['update:modelValue']);

    const toggleSwitch = (event: Event) => {
        const input = event.target as HTMLInputElement
        emit('update:modelValue', input.checked ? props.trueValue : props.falseValue);
    };
</script>

<style scoped>
    .custom-switch
    {
        display: flex;
        align-items: center;
        padding: 0px 0 0px;
    }

    .custom-switch input[type="checkbox"]
    {
        display: none;
    }

    .custom-switch label
    {
        display: flex;
        align-items: center;
        cursor: pointer;
    }

    .custom-switch .slider
    {
        position: relative;
        width: 36px;
        height: 14px;
        background-color: #e9e9e9;
        border-radius: 20px;
        transition: background-color 0.2s;
    }

    .custom-switch .slider::before
    {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        top: calc(50% - 10px);
        left: -2px;
        background-color: #ffffff;
        border-radius: 50%;
        transition: transform 0.2s;
        transform: translateX(1px);
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12);
    }

    .custom-switch input[type="checkbox"]:checked+.slider
    {
        background-color: #1866c033 !important;
    }

    .custom-switch input[type="checkbox"]:checked+.slider::before
    {
        background-color: #3DA8EA;
        transform: translateX(18.5px);
    }

    .label-text
    {
        margin-left: 10px;
        font-size: 14px;
        font-family: "Open Sans", sans-serif;
        font-weight: 500;
        color: rgb(179, 179, 179) !important;
    }
</style>