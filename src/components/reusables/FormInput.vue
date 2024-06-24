<template>
    <div class="field">
        <label :for="id">{{ label }}</label>
        <input :id="id" class="input" type="text" :placeholder="placeholder" :value="modelValue" @input="onInput"
            @keypress="numericHandler" />
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    const props = defineProps({
        label: String,
        placeholder: String,
        modelValue: String,
        numeric: Boolean
    });

    const emit = defineEmits(['update:modelValue']);

    const id = computed(() => `${(props.label ?? '').replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`);

    const numericHandler = computed(() => {
        return props.numeric ? isNumberKey : () => { };
    });

    function onInput(event: Event) {
        const input = event.target as HTMLInputElement
        if (!input) return
        emit('update:modelValue', input.value);
    }

    function isNumberKey(event: KeyboardEvent) {
        const input = event.target as HTMLInputElement;
        if (!input) return;

        if (!/\d/.test(event.key)) {
            event.preventDefault();
        }
    }
</script>

<style scoped>
    .field
    {
        display: flex;
        flex-direction: column;
    }

    .field label
    {
        color: #666666;
        font-size: 12px;
    }

    .input
    {
        display: block;
        width: 100%;
        border: none;
        border-bottom: 1px solid rgba(128, 128, 128, 0.308);
        padding: 6px 6px 2px;
        outline: none;
        font-size: 14px;
        font-weight: 500;
        color: #3DA8EA;
        cursor: pointer;
        background: transparent;
    }
</style>