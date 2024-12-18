<template>
    <div>
        <div class="s140-header">
            <input type="text" class="s140-header-cong" v-model="congStore.congregation.name">
            <div class="s140-header-title">{{ title }}</div>
        </div>
        <div class="s140-hr"> </div>
    </div>
</template>

<script setup lang="ts">

    import translations from '@/assets/utils/translations';
    import { useCongregationStore } from '@/stores/congregation';
    import { computed } from 'vue';

    const congStore = useCongregationStore()

    const title = computed(() => {
        return translations.mwbs140[congStore.congregation.lang].title
    })
</script>