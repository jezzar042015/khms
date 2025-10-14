<template>
    <div v-if="isAuxiChairman" class="auxy-audience">
        <!-- Show assigned audience or "Assign Audience" -->
        <span v-if="!isEditing" @click.self="startEditing" :class="{ blurred: !hasAssignedAudience }">
            {{ hasAssignedAudience ? assignedAudience : 'Assign Audience' }}
        </span>

        <!-- Input appears when editing -->
        <input v-else ref="inputEl" v-model="inputValue" type="text" class="audience-input"
            @keydown.enter.prevent="saveInput" @blur="saveInput" title="Press Enter to Save" />

        <!-- Show selections only while input is focused -->
        <div v-if="showSelections" class="selections" ref="target">
            <div v-for="item in audiences.stored" :key="item" class="option">
                <!-- Click item to assign (use pointerdown so it fires before input blur) -->
                <span @pointerdown.prevent="assignAudience(item)">
                    {{ item }}
                </span>

                <!-- Click × to delete (use pointerdown and stop propagation) -->
                <span class="remove" @pointerdown.stop.prevent="removeAudience(item)" title="Remove option">
                    &times;
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAssignmentStore } from '@/stores/assignment';
    import { useAudienceStore } from '@/stores/audience';
    import { onClickOutside } from '@vueuse/core';
    import { computed, ref, watch, nextTick } from 'vue';

    const assignments = useAssignmentStore();
    const audiences = useAudienceStore();

    const { isAuxiChairman, partId } = defineProps<{
        isAuxiChairman: boolean;
        partId: string;
    }>();

    const isEditing = ref(false);
    const inputValue = ref('');
    const showSelections = ref(false);
    const inputEl = ref<HTMLInputElement | null>(null);
    const target = ref<HTMLElement | null>(null);

    const partid = computed(() => `${partId}.ax1g`);

    const assignedAudience = computed(() => {
        const assigned = assignments.get.find(a => a.pid === partid.value);
        return assigned ? assigned.a : '';
    });

    const hasAssignedAudience = computed(() => assignedAudience.value !== '');

    // Start editing (show input)
    const startEditing = async () => {
        isEditing.value = true;
        inputValue.value = assignedAudience.value as string || ''; // ✅ prefill with current
        await nextTick();
        inputEl.value?.focus();
    };

    // Save input when pressing enter or on blur
    const saveInput = () => {
        const trimmed = inputValue.value.trim();

        if (trimmed) {
            audiences.add(trimmed);
            assignAudience(trimmed);
        } else {
            // ✅ If cleared, remove the assignment
            assignments.remove(partid.value);
        }

        isEditing.value = false;
        showSelections.value = false;
    };

    // Assign audience
    const assignAudience = async (item: string) => {
        inputValue.value = item
        await assignments.upsert({
            pid: partid.value,
            a: item
        })

        isEditing.value = false;
        showSelections.value = false;
    };

    // ✅ Remove audience from store & localStorage
    const removeAudience = (item: string) => {
        audiences.remove(item);

        // Also remove the assignment if it matches the deleted item
        if (assignedAudience.value === item) {
            assignments.remove(partid.value);
        }
    };

    // Show dropdown when input is focused
    watch(inputEl, el => {
        if (el) {
            el.addEventListener('focus', () => (showSelections.value = true));
            el.addEventListener('blur', () => (showSelections.value = false));
        }
    });

    onClickOutside(target, () => (showSelections.value = false));
</script>

<style scoped>
    .auxy-audience
    {
        display: block;
        font-weight: 500;
        font-size: 12px;
        margin-top: -4px;
        padding-left: 20px;
        cursor: pointer;
        position: relative;
    }

    .blurred
    {
        color: gray;
        opacity: 0.5;
    }

    .audience-input
    {
        font-size: 12px;
        padding: 0px 4px;
        width: 120px;
        border: none;
        outline: none;
    }

    .selections
    {
        position: absolute;
        left: 12px;
        margin-top: 2px;
        background: white;
        border-radius: 4px;
        padding: 2px;
        z-index: 10;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px,
            rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }

    .option
    {
        padding: 2px 8px;
        cursor: pointer;
        width: 120px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .option:hover
    {
        background-color: #f1f1f1;
    }

    .remove
    {
        color: #999;
        margin-left: 6px;
        cursor: pointer;
        font-weight: bold;
        padding: 0px 8px;
    }

    .remove:hover
    {
        color: #d33;
    }
</style>
