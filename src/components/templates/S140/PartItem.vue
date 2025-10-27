<template>
    <div :class="gridColumns">

        <div class="s140-grid-titles">

            <!-- Part Runtime Display -->
            <span v-show="part?.time" @click="showTimeAdjuster"
                :class="['s140-runtime', { 'time-adjustable': part.timeAdjustable }]">
                {{ runTime }}
            </span>

            <!-- Part Title -->
            <span v-show="part?.time">
                <span v-if="!overriding" @click="startOverride" :class="[{ writtable: part?.writtable }]">
                    {{ displayTitle }} {{ isOverride ? '' : timeLimit }}
                </span>
                <span v-else class="override-title">
                    <input type="text" v-model="overrideText" @blur="endOverride" ref="editor" placeholder="" />
                </span>
            </span>
        </div>

        <!-- Handling Auxiliary Class Parts -->
        <div class="assignee" v-if="hasAux1Class">
            <span class="s140-part-label" v-show="showLabel">{{ part?.label }}:</span>
            <div :class="assignAux1Classes" v-if="isAux1Part" @click.stop="showSelector($event, 'aux')">
                {{ displayAux1Assignee }}
            </div>
            <AudienceGroup :is-auxi-chairman="isAuxiChairman" :part-id="part.id" />
        </div>

        <!-- Handling Normal Parts -->
        <div class="assignee" v-show="isAssignable" @click.stop="showSelector">
            <span class="s140-part-label" v-show="showLabel" v-if="!hasAux1Class">
                {{ part?.label }}:
            </span>
            <div :class="assignClasses">
                {{ displayAssignee }}
            </div>
        </div>

        <!-- Handling Time Adjustments -->
        <TimeAdjuster style="margin-left: 50px;" v-if="timeAdjuster" :part="part" :part-item="part"
            @close="updatePartTime" />
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, ref, watch } from 'vue';
    import { onClickOutside } from '@vueuse/core';
    import { useAssignmentStore } from '@/stores/assignment';
    import { useCongregationStore } from '@/stores/congregation';
    import { useFilesStore } from '@/stores/files';
    import { useOverridesStore } from '@/stores/overrides';
    import { usePublisherStore } from '@/stores/publisher';
    import { useTimeOverrides } from '@/stores/overrides-time';
    import { useAssignmentSelector } from '@/stores/assignment-selector';
    import type { S140PartItem } from '@/types/files';

    import TimeAdjuster from '@/components/TimeAdjuster.vue';
    import AudienceGroup from '@/components/AudienceGroup.vue'

    const AUX1CLASSIDSUFFIX = '.ax1'
    const assignmentStore = useAssignmentStore();
    const congStore = useCongregationStore();
    const pubStore = usePublisherStore();
    const fileStore = useFilesStore();
    const overrides = useOverridesStore();
    const timeOverrides = useTimeOverrides()
    const selector = useAssignmentSelector()

    const { part } = defineProps<{
        part: S140PartItem
    }>()

    const timeAdjuster = ref(false)
    const showTimeAdjuster = () => {
        if (part.timeAdjustable) {
            timeAdjuster.value = true
        }
    }

    const updatePartTime = (time: number) => {
        timeAdjuster.value = false
        if (Number(time) == 0) return

        if (time !== part.time) {
            timeOverrides.save({
                id: part.id,
                time: time
            })
        }

        if (time === part.time) {
            const storedOverride = timeOverrides.read(part.id)?.time ?? 0
            if (storedOverride > 0) timeOverrides.remove(part.id)
        }
    }

    const partAux1 = ref<S140PartItem | undefined>()

    const isDemo = computed(() => part.roles?.includes('demo'))
    const isBibleReading = computed(() => part.roles?.includes('br'))
    const isTalk = computed(() => part.roles?.includes('talk'))

    const displayAssignee = computed(() => {

        const isVisit = part.roles?.includes('co')
        if (isVisit) return part.co;

        const partid: string = part?.id ?? ''
        const assigned = assignmentStore.get.find(a => a.pid == partid);
        if (!assigned) return 'Not Assigned!';

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
    });

    const displayTitle = computed(() => {
        const override = overrides.read(part.id)

        if (override) {
            return override.title
        }
        return part.title
    })

    const isOverride = computed(() => {
        return overrides.read(part.id) !== null
    })

    const overriding = ref(false);
    const overrideText = ref<string | null>(null)
    const editor = ref<HTMLInputElement | null>(null)

    onClickOutside(editor, () => endOverride())

    const startOverride = () => {
        if (!part?.writtable) return
        overriding.value = true
        nextTick(() => {
            editor.value?.focus();
        });
    }

    const endOverride = () => {
        overriding.value = false

        if (!overrideText.value || overrideText.value == part.title) {
            overrides.remove(part.id)
            return
        }

        overrides.save({
            id: part.id,
            title: overrideText.value
        })
    }

    const displayAux1Assignee = computed(() => {

        if (!partAux1.value) return 'Not Assigned!'

        const partid: string = partAux1.value.id ?? ''
        const assigned = assignmentStore.get.find(a => a.pid == partid);

        if (!assigned) return 'Not Assigned!'

        if (isDemo.value) {
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
            const pub = pubStore.publishers.find(p => p.id == assigned.a);
            return pub ? pub.name : 'Not Assigned!'
        }
    })

    const hasAux1Class = computed<boolean>(() => {
        return congStore.congregation.classId == 2
    })

    const isAuxiChairman = computed<boolean>(() => {
        return part.id.endsWith('.0');
    })

    const hasMeetingDemos = computed<boolean>(() => {
        const weekId = getWeekId(part.id)
        if (!weekId) return false
        const weekParts = fileStore.s140PartItems[weekId]
        const demoParts = weekParts.some(p => p.roles?.includes('demo'))
        return demoParts
    })

    const isAux1Part = computed<boolean>(() => {
        if (!hasAux1Class.value) return false
        const isIntro = part.id.endsWith('.0')

        return isDemo.value || isTalk.value || (isBibleReading.value && hasMeetingDemos.value
            || (isIntro && hasMeetingDemos.value))
    })

    const isAssignable = computed<boolean>(() => {
        return (part.roles || []).length > 0
    })

    const assignClasses = computed(() => {
        return [
            's140-person',
            { 'faded': displayAssignee.value == 'Not Assigned!' }
        ]
    })

    const assignAux1Classes = computed(() => {
        return [
            's140-person',
            { 'faded': displayAux1Assignee.value == 'Not Assigned!' }
        ]
    })

    const timeLimit = computed(() => {
        if (!part?.time) return null
        if (part.showNoTime) return null
        return `(${part.time} min.)`
    })

    const runTime = computed<string | null>(() => {
        if (typeof part.runtime !== 'number') return null
        const startTime = congStore.congregation.midweekTime ?? '06:00'
        return displayTime(startTime, part?.runtime)
    })

    const gridColumns = computed<string>(() => {
        const minClasses = congStore.congregation.classId;

        if (minClasses == 1) {
            return 's140-grid-col2 s140-part-item'
        } else if (minClasses == 2) {
            return 's140-grid-col3 s140-part-item'
        } else {
            return 's140-part-item'
        }
    });

    const showLabel = computed(() => {
        const hasLabel = Boolean(part?.label)
        const hasVisit = part.roles?.includes('co')
        return (hasLabel && !hasVisit)
    })

    function showSelector(e: MouseEvent, targetPart: 'aux' | 'def' = 'def'): void {
        const target = e.currentTarget as HTMLElement | null
        if (!target) return

        const rect = target.getBoundingClientRect()

        // selects part to assign to selector by default or auxillary
        const p: S140PartItem | undefined = targetPart === 'def' ? part : partAux1.value

        if (!p) return

        selector.setTargetRect(rect, p)
    }

    function displayTime(startingTime: string, minutesToAdd: number) {
        const [startHours, startMinutes] = startingTime.split(':').map(Number);
        let totalMinutes = startHours * 60 + startMinutes + minutesToAdd;
        let newHours = Math.floor(totalMinutes / 60) % 24;
        const newMinutes = totalMinutes % 60;

        if (newHours === 0) {
            newHours = 12;
        } else if (newHours > 12) {
            newHours -= 12;
        }

        const formattedHours = newHours.toString().padStart(2, '0');
        const formattedMinutes = newMinutes.toString().padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}`;
    }

    function loadAux1Part(): void {
        if (isAux1Part.value) {
            const isIntro = part.id.endsWith('.0')
            partAux1.value = {
                id: `${part.id}${AUX1CLASSIDSUFFIX}`,
                title: 'Auxy Class 1 | ' + (isIntro ? 'Counselor' : part.title),
                roles: [...part.roles ?? []],
            }
        }
    }

    function getWeekId(partId: string): string | null {
        const regex = /^(\d+\.\d+)\.\d+/;
        const match = partId.match(regex);
        return match ? match[1] : null;
    }

    onMounted(() => {
        loadAux1Part()
        overrideText.value = displayTitle.value
    })

    watch(
        () => part.id,
        () => loadAux1Part(),
        { deep: true }
    )

</script>

<style scoped>
    .override-title input
    {
        font-weight: 500;
        color: #555;
        font-size: 1em;
        border: none;
        border-bottom: 1px solid #55555583;
        width: 100%;
        outline: none;
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

    .time-adjustable
    {
        cursor: pointer;
    }

</style>