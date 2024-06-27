<template>
    <div class="title" :style="bg">
        <div class="week-sched">
            <span class="icon">
                <IconCalendar />
            </span>
            <span class="week-date">
                {{ w.week }}
            </span>
        </div>
        <div class="week-sched">
            <span class="icon">
                <IconBible />
            </span>
            <span>
                {{ w.bibleReading }}
            </span>
        </div>
        <div class="week-sched">
            <span class="icon">
                <IconMusicNotes />
            </span>
            <span>
                {{ w.songs.join(', ') }}
            </span>
        </div>
        <div class="week-sched">
            <span class="icon">
                <IconPraying />
            </span>
            <span>
                <div class="assignee" @click.stop="showSelector">
                    {{ displayAssignee }}
                </div>

                <!-- <PublisherSelector v-if="selector.show" :part="prayer" @mouseleave="hideSelector" :me="selector"
                    :assignee="assignee" /> -->
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import IconCalendar from '@/components/icons/IconCalendar.vue';
    import IconBible from '@/components/icons/IconBible.vue';
    import IconMusicNotes from '../../icons/IconMusicNotes.vue';
    import IconPraying from '../../icons/IconPraying.vue';
    // import PublisherSelector from '@/components/templates/template-psp/PublisherSelector.vue'

    import { computed, ref, watch, onMounted } from 'vue';
    import { useFilesStore } from '@/stores/files';
    import { useAssignmentStore } from '@/stores/assignment';
    import { usePublisherStore } from '@/stores/publisher';
    import type { WeekItem } from '@/types/files';

    const selector = ref({
        show: false
    })

    const fileStore = useFilesStore()
    const assignStore = useAssignmentStore();
    const pubStore = usePublisherStore()
    const props = defineProps<{
        w: WeekItem
    }>()

    const prayer = ref({
        id: '',
        roles: ['elder', 'ms', 'prayer']
    })

    const displayAssignee = computed(() => {
        const partid = props.w.id
        const assigned = assignStore.get.find(a => a.pid == partid);
        if (!assigned) return 'Not Assigned!'

        if (Array.isArray(assigned.a)) {
            const p = []
            const pub1 = pubStore.publishers.find(p => p.id == (assigned.a[0]))
            const pub2 = pubStore.publishers.find(p => p.id == (assigned.a[1]))
            if (pub1) p.push(pub1.name)
            if (pub2) p.push(pub2.name)
            return p.length > 0 ? p.join(' & ') : 'Not Assigned!'
        }

        return null
    })

    // const assignee = computed(() => {
    //     const partid = props.w.id
    //     const assigned = assignmentStore.getAssignments[partid];
    //     return assigned
    // })

    const bg = computed<{ background: string } | null>(() => {
        if (!fileStore.loadedMonth) return null
        return { background: fileStore.loadedMonth.content.theme }
    })

    function showSelector(): void {
        selector.value.show = true
    }

    function hideSelector(): void {
        selector.value.show = false
    }

    watch(
        () => props.w,
        (newVal) => {
            prayer.value.id = newVal.id
        },
        { deep: true }
    )

    onMounted(() => {
        prayer.value.id = props.w.id
    })



</script>