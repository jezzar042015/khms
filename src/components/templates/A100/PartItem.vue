<template>
    <div :class="{ 'pt-wrapper': part.class !== 'accessory' }">
        <div :class="itemClasses">
            <span class="relative">
                <span :class="{ 'timer': isLiving && part.title }" @click="timerAdjuster = !timerAdjuster">
                    {{ time }}
                </span>
                <TimeAdjuster :active-time="partItem.time" :part="part" v-if="isLiving && timerAdjuster && part.title"
                    @close="updatePartTime" />
            </span>
            <span v-if="part.thumbnail">
                <div class="part-thumbnail">
                    <img :src="thumbnail ?? ''" alt="" :class="thumbnailImageClass">
                </div>
            </span>
            <span v-else class="thumbnail-alt">{{ part.alt }}</span>

            <span>
                <div @click="startOverride" v-if="showTitle" :class="[part.class, { 'writtable': part.writtable }]">
                    {{ displayTitle }}
                </div>

                <div v-if="isOverriding" class="editor" ref="editor">
                    <textarea type="text" v-model="overrideText" :class="part.class"></textarea>
                </div>
                <div class="generic-label">{{ part.reference }}</div>
                <div class="assignee" @click="showSelector">
                    <div :class="assignClasses">{{ displayAssignee }}</div>
                    <AssignmentSelector v-if="selector" :part="partItem" :triggered="triggered" @hide="hideSelector"
                        @trigger-off="triggerOff" />
                </div>
            </span>
        </div>

    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { useAssignmentStore } from '@/stores/assignment';
    import { useOverridesStore } from '@/stores/overrides';
    import { usePublisherStore } from '@/stores/publisher';
    import { useTimeOverrides } from '@/stores/timeOverrides';
    import type { PartItem } from '@/types/files';

    import thumbnails from '@/assets/utils/thumbnails';
    import AssignmentSelector from '@/components/AssignmentSelector.vue';
    import TimeAdjuster from '@/components/TimeAdjuster.vue';

    const { part, isLiving = false } = defineProps<{
        part: PartItem
        isLiving?: boolean
    }>()

    const partItem = ref<PartItem>(
        { ...part }
    )

    const timerAdjuster = ref(false)
    const selector = ref(false)
    const triggered = ref(false)

    const updatePartTime = (time: number) => {
        if (time !== partItem.value.time) {
            partItem.value.time = time
            timeOverrides.save({
                id: part.id,
                time: time
            })
        }

        if (time === part.time) {
            const storedOverride = timeOverrides.read(part.id)?.time ?? 0
            if (storedOverride > 0) timeOverrides.remove(part.id)
        }

        timerAdjuster.value = false
    }

    const assignmentStore = useAssignmentStore();
    const pubStore = usePublisherStore()
    const overrides = useOverridesStore()
    const timeOverrides = useTimeOverrides()

    const isDemo = computed(() => part.roles?.includes('demo'))
    const isBibleReading = computed(() => part.roles?.includes('br'))
    const isTalk = computed(() => part.roles?.includes('talk'))

    const displayAssignee = computed(() => {
        if (part?.isVisit) return part.co

        const partid: string = part?.id ?? ''
        const assigned = assignmentStore.get.find(a => a.pid == partid);
        if (!assigned) return 'Not Assigned!'

        if (typeof assigned.a === 'string') {
            const pub = pubStore.publishers.find(p => p.id == (assigned?.a));
            return pub?.name || 'Not Assigned!';

        } else if (isDemo.value) {
            const p = [];
            const pub1 = pubStore.publishers.find(p => p.id == (assigned.a[0]));
            const pub2 = pubStore.publishers.find(p => p.id == (assigned.a[1]));
            if (pub1) p.push(pub1.name);
            if (pub2) p.push(pub2.name);
            return p.length > 0 ? p.join(' & ') : 'Not Assigned!';

        } else if (isTalk.value || isBibleReading.value) {
            const pub = pubStore.publishers.find(p => p.id == (assigned.a[0]));
            return pub ? pub.name : ''

        } else {
            return null;
        }
    })

    const assignClasses = computed(() => {
        return [
            'assign-to',
            { 'faded': displayAssignee.value == 'Not Assigned!' }
        ]
    })

    const thumbnail = computed<string | null>(() => {
        if (!part.thumbnail) return null
        const tn = thumbnails[part.thumbnail]
        return (tn) ? tn.thumbnail : part.thumbnail
    });

    const thumbnailImageClass = computed(() => {
        const modes = {
            'w-50': 'image-50',
            'w-1/3': 'image-33',
            'sqr-c': 'image-center',
            'sqr-r': 'image-sqr-right'
        };

        return part.thumbnailMode ? modes[part.thumbnailMode] || null : null;
    });

    const time = computed<string | null>(() => {
        if (!partItem.value.time) return null
        return `${partItem.value.time}m`
    })

    const itemClasses = computed<string>(() => {
        if (part.class == 'accessory')
            return 'accessory'
        return 'part-item'
    })

    function showSelector(): void {
        triggered.value = true
        selector.value = true
    }

    function hideSelector(): void {
        selector.value = false
    }

    function triggerOff(): void {
        triggered.value = false
    }

    // title handling
    const isOverriding = ref(false)
    const editor = ref<HTMLTextAreaElement | null>(null)
    const overrideText = ref('')

    onClickOutside(editor, () => endOverride())

    const showTitle = computed(() => {
        return part.title && !isOverriding.value
    })

    const displayTitle = computed(() => {
        const override = overrides.read(part.id)

        if (override) {
            return override.title
        }
        return part.title
    })

    const startOverride = () => {
        if (!part.writtable) return
        isOverriding.value = true
        nextTick(() => {
            editor.value?.focus();
        });
    }

    const endOverride = () => {
        isOverriding.value = false

        if (!overrideText.value || overrideText.value == part.title) {
            overrides.remove(part.id)
            return
        }

        overrides.save({
            id: part.id,
            title: overrideText.value
        })
    }

    watch(
        () => part.id,
        () => {
            overrideText.value = overrides.read(part.id)?.title ?? ''
            const time = timeOverrides.read(part.id)?.time ?? ''

            if (time) {
                partItem.value.time = time
            }
        },
        { immediate: true })

</script>

<style scoped>
    .accessory
    {
        display: grid;
        grid-template-columns: 2fr 4fr 10fr;
        padding-bottom: 3px;
    }

    .writtable
    {
        transition: all ease-in-out .1s;
    }

    .writtable:hover
    {
        cursor: pointer;
        color: #3DA8EA;

    }

    .editor textarea
    {
        outline: none;
        border: none;
        border-bottom: 1px solid #55555565;
        resize: none;
        width: 100%;
        font-size: 1em;
    }

    .timer
    {
        padding-right: 6px;
        padding-bottom: 6px;
        cursor: pointer;
        transition: all;
    }

    .timer:hover
    {
        color: skyblue;
    }

    .pt-wrapper
    {
        position: relative;
    }
</style>