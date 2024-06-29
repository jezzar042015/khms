<template>
    <TemplateView>
        <div id="template-bg">
            <div id="fsl-mwb">
                <article>
                    <div id="grid-slips">
                        <template v-for="part in fileStore.studentsParts" :key="part.id">
                            <SlipTemplate :part="part" />
                        </template>
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
        padding: 20px 90px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-auto-rows: 540px;
        gap: 10px;
    }

    @media only screen and (max-width: 1025px)
    {
        #grid-slips
        {
            padding: 20px 60px;
        }
    }

    @media only screen and (max-width: 928px)
    {
        #grid-slips
        {
            padding: 20px 10px;
        }
    }

    @media only screen and (max-width: 828px)
    {
        #grid-slips
        {
            padding: 10px 0px;
        }
    }
</style>
