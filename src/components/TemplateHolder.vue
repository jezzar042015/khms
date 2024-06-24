<template>
    <TemplateView>
        <div id="template-bg">
            <div id="fsl-mwb">
                <article id="art-temp-psp" v-if="isCustomize">
                    <!-- <CustomizedTemplate /> -->
                    <div>Customized Template</div>
                </article>
                <article v-if="isS140">
                    <OfficialTemplate />
                </article>
            </div>
        </div>
    </TemplateView>
</template>

<script setup lang="ts">
    import { computed, onMounted } from 'vue';
    import { useCongregationStore } from '@/stores/congregation';


    import TemplateView from '@/components/layouts/TemplateView.vue'

    // import CustomizedTemplate from '@/components/templates/template-psp/_Customized.vue';
    import OfficialTemplate from '@/components/templates/S140/AppWrapper.vue';

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