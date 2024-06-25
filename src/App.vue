<template>
  <div id="app-content">
    <AppWelcome v-if="viewStore.welcomePage" />
    <TemplateHolder v-if="viewStore.mwbTemplate" />
    <PublishersList v-if="viewStore.pubsList" />
  </div>

  <SmallScreen />
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';

  import { useCongregationStore } from './stores/congregation';
  import { usePublisherStore } from './stores/publisher';
  import { useVisitStore } from './stores/visits';
  import { useEventStore } from './stores/events';
  import { useViewStore } from './stores/views';
  import { useFilesStore } from './stores/files';

  import SmallScreen from './components/layouts/SmallScreen.vue';
  import AppWelcome from './components/AppWelcome.vue';
  import TemplateHolder from './components/TemplateHolder.vue';
  import PublishersList from '@/components/PublishersList.vue'

  const congStore = useCongregationStore()
  const pubsStore = usePublisherStore()
  const visitStore = useVisitStore()
  const eventStore = useEventStore()
  const viewStore = useViewStore()
  const fileStore = useFilesStore()

  async function loadLocals() {
    await congStore.loadLocal();
    pubsStore.loadLocal();

    const passRequireds = await viewStore.init()
    if (!passRequireds) return

    await visitStore.loadLocal();
    await eventStore.loadLocal();
    await fileStore.loadFiles();
    await fileStore.loadMonthTemplate();
  }

  onMounted(async () => {
    await loadLocals()
  })
</script>