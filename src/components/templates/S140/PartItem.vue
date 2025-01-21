<template>
    <div :class="gridColumns">
        <div class="s140-grid-titles">
            <span v-show="part?.time" class="s140-runtime">{{ runTime }}</span>
            <span v-show="part?.time">
                <span v-if="!overriding" @click="startOverride" :class="[{ writtable: part?.writtable }]">
                    {{ displayTitle }} {{ isOverride ? '' : timeLimit }}
                </span>
                <span v-else class="override-title">
                    <input type="text" v-model="overrideText" @blur="endOverride" ref="editor" placeholder="" />
                </span>
            </span>
        </div>
        <div class="assignee" v-if="hasAux1Class">
            <span class="s140-part-label" v-show="showLabel">{{ part?.label }}:</span>
            <div :class="assignAux1Classes" v-if="isAux1Part" @click="showAux1Selector">
                {{ displayAux1Assignee }}
            </div>
            <AssignmentSelector v-if="selectorAux1 && partAux1" :part="partAux1" :triggered="triggeredSelector"
                @hide="hideSelector" @trigger-off="triggerOff" />
        </div>
        <div class="assignee" v-show="isAssignable" @click="showSelector">
            <span class="s140-part-label" v-show="showLabel" v-if="!hasAux1Class"> {{
                part?.label }}: </span>
            <div :class="assignClasses">
                {{ displayAssignee }}
            </div>
            <AssignmentSelector v-if="selector" :part="part" :triggered="triggeredSelector" @hide="hideSelector"
                @trigger-off="triggerOff" />
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, onMounted, ref, watch } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import { useCongregationStore } from '@/stores/congregation';
    import { usePublisherStore } from '@/stores/publisher';
    import { useFilesStore } from '@/stores/files';
    import { useOverridesStore } from '@/stores/overrides';
    import type { S140PartItem } from '@/types/files';

    import AssignmentSelector from '@/components/AssignmentSelector.vue'
    import { onClickOutside } from '@vueuse/core';

    const AUX1CLASSIDSUFFIX = '.ax1'
    const assignmentStore = useAssignmentStore();
    const congStore = useCongregationStore();
    const pubStore = usePublisherStore();
    const fileStore = useFilesStore();
    const overrides = useOverridesStore();

    const props = defineProps<{
        part: S140PartItem
    }>()

    const partAux1 = ref<S140PartItem | undefined>()

    const selector = ref(false);
    const selectorAux1 = ref(false);
    const triggeredSelector = ref(false);

    const isDemo = computed(() => props.part.roles?.includes('demo'))
    const isBibleReading = computed(() => props.part.roles?.includes('br'))
    const isTalk = computed(() => props.part.roles?.includes('talk'))

    const displayAssignee = computed(() => {

        const isVisit = props.part.roles?.includes('co')
        if (isVisit) return props.part.co;

        const partid: string = props.part?.id ?? ''
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
        const override = overrides.read(props.part.id)

        if (override) {
            return override.title
        }
        return props.part.title
    })

    const isOverride = computed(() => {
        return overrides.read(props.part.id) !== null
    })

    const overriding = ref(false);
    const overrideText = ref<string | null>(null)
    const editor = ref<HTMLInputElement | null>(null)

    onClickOutside(editor, () => endOverride())

    const startOverride = () => {
        if (!props.part?.writtable) return
        overriding.value = true
        nextTick(() => {
            editor.value?.focus();
        });
    }

    const endOverride = () => {
        overriding.value = false

        if (!overrideText.value || overrideText.value == props.part.title) {
            overrides.remove(props.part.id)
            return
        }



        overrides.save({
            id: props.part.id,
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

    const hasMeetingDemos = computed<boolean>(() => {
        const weekId = getWeekId(props.part.id)
        if (!weekId) return false
        const weekParts = fileStore.s140PartItems[weekId]
        const demoParts = weekParts.some(p => p.roles?.includes('demo'))
        return demoParts
    })

    const isAux1Part = computed<boolean>(() => {
        if (!hasAux1Class.value) return false
        const isIntro = props.part.id.endsWith('.0')

        return isDemo.value || isTalk.value || (isBibleReading.value && hasMeetingDemos.value
            || (isIntro && hasMeetingDemos.value))
    })

    const isAssignable = computed<boolean>(() => {
        return (props.part.roles || []).length > 0
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
        if (!props.part?.time) return null
        if (props.part.showNoTime) return null
        return `(${props.part.time} min.)`
    })

    const runTime = computed<string | null>(() => {
        if (typeof props.part.runtime !== 'number') return null
        const startTime = congStore.congregation.midweekTime ?? '06:00'
        return displayTime(startTime, props.part?.runtime)
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
        const hasLabel = Boolean(props.part?.label)
        const hasVisit = props.part.roles?.includes('co')
        return (hasLabel && !hasVisit)
    })

    function showSelector(): void {
        triggeredSelector.value = true
        selector.value = true
    }

    function showAux1Selector(): void {
        triggeredSelector.value = true
        selectorAux1.value = true
    }

    function triggerOff(): void {
        triggeredSelector.value = false
    }

    function hideSelector(): void {
        selector.value = false
        selectorAux1.value = false
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
            const isIntro = props.part.id.endsWith('.0')
            partAux1.value = {
                id: `${props.part.id}${AUX1CLASSIDSUFFIX}`,
                title: 'Auxy Class 1 | ' + (isIntro ? 'Counselor' : props.part.title),
                roles: [...props.part.roles ?? []],
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
        () => props.part.id,
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
</style>