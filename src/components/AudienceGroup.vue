<template>
    <div v-if="isAuxiChairman" class="auxy-audience">
        <span @click="onSelection = true" v-if="hasAssignedAudience">{{ assignedAudience }}</span>
        <span @click="onSelection = true" v-else class="blurred">Assign Audience</span>
        <div class="selections" v-if="onSelection" ref="target">
            <div v-for="item in audiences.stored" :key="item">
                <div class="option">{{ item }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useAssignmentStore } from '@/stores/assignment';
    import { useAudienceStore } from '@/stores/audience';
    import { onClickOutside } from '@vueuse/core';
    import { computed, ref } from 'vue';

    const assignments = useAssignmentStore();
    const audiences = useAudienceStore()
    const onSelection = ref(false)
    const target = ref<HTMLElement | null>(null)
    onClickOutside(target, () => onSelection.value = false)

    const { isAuxiChairman, partId } = defineProps<{
        isAuxiChairman: boolean
        partId: string
    }>()

    const assignedAudience = computed(() => {
        const partid = `${partId}.ax1g`
        const assigned = assignments.get.find(a => a.pid == partid);
        return assigned ? assigned.a : ''
    })

    const hasAssignedAudience = computed(() => assignedAudience.value !== '')

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
        opacity: .5;
    }

    .selections
    {
        position: absolute;
        left: 12px;
        padding: 2px;
        background: white;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }

    .option
    {
        padding: 2px 8px;
    }
</style>