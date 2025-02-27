<template>
    <div class="select field" @mouseleave="hideOptions" @click.stop="toggleOptions">
        <label :for="id">{{ label }}</label>
        <input :id="id" class="input" type="text" :placeholder="placeholder" readonly :value="selectedDisplayValue" />
        <div :class="ddClasses">
            <div class="dd-items" v-for="item in items" :key="item[id]" @click="selectItem(item)">
                {{ item[display] }}
            </div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <g id="Arrow / Caret_Down_MD">
                    <path id="Vector" d="M16 10L12 14L8 10" stroke="#000000" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                </g>
            </g>
        </svg>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';

    type ItemType = { [key: string]: any };

    const {
        modelValue,
        items = [],
        id = 'id',
        display = 'name',
        placeholder = 'Select',
        label = null,
    } = defineProps<{
        modelValue?: string | number;
        items?: ItemType[];
        id?: string;
        display?: string;
        placeholder?: string;
        label?: string;
    }>()

    const isOpen = ref(false);

    const emit = defineEmits(['update:modelValue']);

    const selectedItem = computed<ItemType | null>(() =>
        items.find((item) => item && item[id] === modelValue) || null
    );

    const selectedDisplayValue = computed<string>(() =>
        selectedItem.value ? selectedItem.value[display] : ''
    );

    const ddClasses = computed(() => ({
        'dd-holder': true,
        show: isOpen.value,
    }));

    function toggleOptions() {
        isOpen.value = !isOpen.value;
    }

    function hideOptions() {
        isOpen.value = false;
    }

    const selectItem = (item: ItemType) => {
        emit('update:modelValue', item[id]);
        isOpen.value = false;
    };
</script>

<style scoped>

    .input
    {
        display: block;
        width: 100%;
        border: none;
        border-bottom: 1px solid rgba(128, 128, 128, 0.308);
        padding: 6px 6px 2px;
        margin: 0;
        outline: none;
        font-size: 14px;
        font-weight: 500;
        color: #3da8ea;
        cursor: pointer;
        background: transparent;
    }


    .select
    {
        position: relative;
        cursor: pointer !important;
    }

    .dd-holder.show
    {
        display: flex;
        opacity: 1;
    }

    .dd-holder
    {
        display: none;
        opacity: 0;
        position: absolute;
        width: 100%;
        background: white;
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        z-index: 1;
        top: calc(100% - 1px);
        transform: translateY(0);
        transition: opacity 0.3s;
        flex-direction: column;
        max-height: 200px;
        overflow-y: auto;
    }

    .dd-items
    {
        cursor: pointer;
        padding: 10px;
        font-size: 14px;
        font-weight: 500;
        color: rgba(128, 128, 128, 0.795);
    }

    .dd-items:hover
    {
        color: gray;
    }

    .field label
    {
        color: #666666;
        font-size: 12px;
    }

    svg
    {
        position: absolute;
        height: 28px;
        top: 19px;
        right: 0px;
        opacity: .5;
    }
</style>