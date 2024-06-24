<template>
    <TemplateView>
        <div id="template-bg">
            <div id="fsl-mwb">
                <article id="art-temp-psp" v-if="isCustomize">
                    <!-- <CustomizedTemplate /> -->
                    <div>Customized Template</div>
                </article>
                <article v-if="isS140">
                    <div>S140 Template</div>
                    <!-- <SimpleTemplate /> -->
                </article>
            </div>
        </div>
    </TemplateView>
</template>

<script setup lang="ts">
    import { computed, onMounted } from 'vue';


    import TemplateView from '@/components/layouts/TemplateView.vue'
    import { useCongregationStore } from '@/stores/congregation';
    // import CustomizedTemplate from '@/components/templates/template-psp/_Customized.vue';
    // import SimpleTemplate from '@/components/templates/template-s140/_MainTemplate.vue';

    const congStore = useCongregationStore()

    const isCustomize = computed(() => {
        return congStore.congregation.mwbTemplate === 'a-100'
    })

    const isS140 = computed(() => {
        return congStore.congregation.mwbTemplate === 's-140'
    })

    // onMounted(async () => {
    //     await fileStore.loadFiles();
    // })

</script>