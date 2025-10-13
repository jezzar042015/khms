<template>
    <div v-if="isAuxiChairman" class="auxy-audience">
        <span v-if="hasAssignedAudience">{{ assignedAudience }}</span>
        <span v-else class="blurred">Assign Audience</span>
    </div>
</template>

<script setup lang="ts">
    import { useAssignmentStore } from '@/stores/assignment';
    import { computed } from 'vue';

    const assignments = useAssignmentStore();

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
    }

    .blurred
    {
        color: gray;
        opacity: .5;
    }
</style>