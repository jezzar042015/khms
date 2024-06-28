<template>
    <TemplateView>
        <div id="template-bg">
            <div id="fsl-mwb">
                <article>
                    <div id="grid-slips">
                        <div v-for="part in fileStore.studentsParts" :key="part.id">
                            <SlipTemplate :part="part" />
                        </div>
                    </div>
                </article>
            </div>
        </div>
    </TemplateView>
</template>

<script setup lang="ts">
    import { useFilesStore } from '@/stores/files';
    import TemplateView from '@/components/layouts/TemplateView.vue'
    import SlipTemplate from '@/components/SlipTemplate.vue'

    const fileStore = useFilesStore()
</script>

<style scoped>
    #grid-slips
    {
        padding: 60px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-auto-rows: 540px;
        gap: 50px;
    }
</style>
