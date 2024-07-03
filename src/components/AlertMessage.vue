<template>
    <PopAlert>
        <div>

        </div>
        <div>

        </div>
        <div>
            <button @click="close">Cancel</button>
        </div>
    </PopAlert>
</template>

<script setup lang="ts">
    import { AlertSettings } from '@/types/vforms'
    import { useViewStore } from '@/stores/views';
    import PopAlert from '@/components/layouts/PopAlert.vue'

    const viewStore = useViewStore()
    const props = defineProps<{
        settings: AlertSettings
    }>

    function close() {
        viewStore.setPopAlert(false)
    }
</script>

<style scoped></style>