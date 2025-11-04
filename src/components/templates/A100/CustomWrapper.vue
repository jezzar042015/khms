<template>
    <MainHeader />
    <TheSections />
    <WeeksContainer />
    <AssignmentSelector />
</template>

<script setup>
    import MainHeader from '@/components/templates/A100/TheHeader.vue';
    import TheSections from '@/components/templates/A100/TheSections.vue';
    import WeeksContainer from './WeeksContainer.vue';
    import AssignmentSelector from '@/components/AssignmentSelector.vue';
</script>