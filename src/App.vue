<template>
  <div id="app-content">
    <AppWelcome v-if="viewStore.welcomePage" />
    <TemplateHolder v-if="viewStore.mwbTemplate" />
    <PublishersList v-if="viewStore.pubsList" />
    <AssignmentSlips v-if="viewStore.assignmentSlips" />
    <UserSurvey v-if="viewStore.survey" @exit-me="viewStore.exitSurvey" />
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
  import { useSurveysStore } from './stores/survey';
  import { useRouterStore } from './stores/router';
  import { useOverridesStore } from './stores/overrides';

  import SmallScreen from './components/layouts/SmallScreen.vue';
  import AppWelcome from './components/AppWelcome.vue';
  import TemplateHolder from './components/TemplateHolder.vue';
  import PublishersList from '@/components/PublishersList.vue'
  import AssignmentSlips from '@/components/AssignmentSlips.vue'
  import UserSurvey from './components/announcements/UserSurvey.vue';

  const congStore = useCongregationStore()
  const pubsStore = usePublisherStore()
  const visitStore = useVisitStore()
  const eventStore = useEventStore()
  const viewStore = useViewStore()
  const fileStore = useFilesStore()
  const surveyStore = useSurveysStore()
  const router = useRouterStore()
  const overrides = useOverridesStore()

  async function loadLocals() {
    await congStore.loadLocal();
    pubsStore.loadLocal();

    const passRequireds = await viewStore.init()
    if (!passRequireds) return

    await visitStore.loadLocal();
    await eventStore.loadLocal();
    await fileStore.loadFiles();
    await fileStore.loadMonthTemplate();
    await surveyStore.load()
  }

  onMounted(async () => {
    router.loadParams()
    await loadLocals()
    router.pruneParams()
    await overrides.prune();
  })


</script>