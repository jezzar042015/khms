<template>
    <div :class="selectorClasses" ref="assignSelector" @click.stop>
        <div class="wrapper">
            <span :class="arrowClasses" ref="arrow"></span>

            <assignment-selector-header :part :is-closing-prayer="isClosingPrayer" :is-open-prayer="isOpenPrayer"
                :no-assignables="noAssignables" />

            <div v-if="longList">
                <input type="text" class="filter" placeholder="Filter" v-model="filter">
            </div>
            <div class="list-options-wrapper">
                <div class="list">
                    <template v-for="a in filteredAssignables" :key="a.id">
                        <assignment-selector-item :person="a" :assignment="assignment" :are-prayers="arePrayers"
                            :are-interpreters="areInterpreters" @set-assignment="setAssignment" />
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

    /**
     * @description modal pane component that allows the user to select publisher(s) to handle parts
    */

    import { computed, onMounted, onUnmounted, ref } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import { useCongregationStore } from '@/stores/congregation';
    import { useFilesStore } from '@/stores/files';
    import { usePublisherStore } from '@/stores/publisher';
    import { useToast } from 'vue-toast-notification';
    import type { S140PartItem, PartItem } from '@/types/files';
    import type { Publisher } from '@/types/publisher';
    import type { MWBAssignment } from '@/types/mwb';
    import AssignmentSelectorItem from './AssignmentSelectorItem.vue'
    import AssignmentSelectorHeader from './AssignmentSelectorHeader.vue'

    type A100Position = 'right' | 'left'
    const emits = defineEmits(['hide', 'trigger-off'])
    const pubStore = usePublisherStore()
    const assignStore = useAssignmentStore()
    const congStore = useCongregationStore()
    const fileStore = useFilesStore()

    const $toast = useToast();
    const filter = ref('')
    const assignment = ref<MWBAssignment>({
        pid: '', a: ''
    })

    const mouseYpos = ref<number>(0)
    const mouseXpos = ref<number>(0)
    const a100Pos = ref<A100Position>('right')

    const { part, triggered } = defineProps<{
        part: S140PartItem | PartItem,
        triggered: boolean,
    }>()

    const assignSelector = ref<HTMLElement | null>(null)
    const arrow = ref<HTMLElement | null>(null)

    /**
     * @description provides classes that will the basis of the pane position in relation to PartItem
     * @returns (string) css classes delimited by a comma 
    */
    const selectorClasses = computed<string>(() => {
        const is140 = congStore.congregation.mwbTemplate == 's-140'
        const a100Class = a100Pos.value === 'left' ? ' ona100-right' : ' ona100-left';
        return 'assign-selector' + (is140 ? ' ons140' : a100Class)
    })

    /**
     * @description provides classes that will the basis of the pane's arrow position in relation to PartItem
     * @returns (string) css classes delimited by a comma 
    */
    const arrowClasses = computed<string>(() => {
        const is140 = congStore.congregation.mwbTemplate == 's-140'
        const a100Class = a100Pos.value === 'left' ? ' arrow-left' : ' arrow-right';
        return 'arrow' + (is140 ? ' arrow-right' : a100Class)
    })

    const isOpenPrayer = computed<boolean>(() => {
        return part.id.endsWith('.op')
    })

    const isClosingPrayer = computed<boolean>(() => {
        return part.id.endsWith('.cp')
    })

    /**
     * @description array of assignable publishers filtered by the part's required roles
     * @description the return is an array sorted by names
     * @returns (Publisher[])
    */
    const assignables = computed<Publisher[]>(() => {
        if (!part.roles) return pubStore.publishers

        const list = pubStore.publishers.filter(publisher =>
            publisher.roles.some(role => part.roles?.includes(role))
        )

        const studentparts: string[] = ["demo", "br", "talk"]
        const isStudentPart = part.roles.some(r => studentparts.includes(r))

        // Exclude publishers who already have assignments this week for student parts
        const filteredList = isStudentPart
            ? list.filter(p => !hasAssignments.value.includes(p.id ?? ''))
            : list

        return filteredList.sort((a, b) => {
            const pa = +(assignment.value.a?.includes(a.id || '') || false)
            const pb = +(assignment.value.a?.includes(b.id || '') || false)
            return pb - pa
        })
    })

    /**
     * @description array of publishers already has assigned part this week
     * @returns (string[])
    */
    const hasAssignments = computed(() => {
        const weekId = part.id.substring(0, 8) ?? ''
        const studentPartIds = fileStore.studentsParts
            .filter(s => s.id.startsWith(weekId))
            .map(m => m.id)

        const currentAssigned = Array.isArray(assignment.value.a)
            ? assignment.value.a.filter(Boolean)
            : (assignment.value.a ? [assignment.value.a] : [])

        return Array.from(new Set(
            assignStore.get
                .filter(s => studentPartIds.includes(s.pid))
                .flatMap(s => Array.isArray(s.a) ? s.a : [s.a])
                .filter(Boolean)
                .filter(id => !currentAssigned.includes(id as string))
        ))
    })


    /**
     * @description the final array of assignable publishers after user filter is applied
     * @returns (Publisher[])
    */
    const filteredAssignables = computed<Publisher[]>(() => {
        if (!filter.value) return assignables.value
        const f = filter.value.toLowerCase()
        return assignables.value.filter(pub => pub.name.toLowerCase().includes(f))
    })

    const noAssignables = computed<boolean>(() => {
        return assignables.value.length === 0
    })

    const longList = computed<boolean>(() => {
        const minimumLongList = 8
        return assignables.value.length > minimumLongList
    })

    const isDemo = computed(() => part.roles?.includes('demo'))
    const isBibleReading = computed(() => part.roles?.includes('br'))
    const isTalk = computed(() => part.roles?.includes('talk'))
    const arePrayers = computed(() => part.roles?.includes('prayers') ?? false)
    const areInterpreters = computed(() => part.roles?.includes('intr') ?? false)

    /**
     * @description handles assigning or removing the assignment to or from a publisher
     * @param id (string)
     * @returns (void) 
     * */
    async function setAssignment(id: string): Promise<void> {

        let added: boolean = true;

        if ((isDemo.value || arePrayers.value || areInterpreters.value || isBibleReading.value || isTalk.value) && Array.isArray(assignment.value.a)) {
            // dual assignment parts
            if (assignment.value.a.includes(id)) { // if person is already assigned
                added = false
                assignment.value.a = assignment.value.a.filter(a => a != id)
            } else if (assignment.value.a.length <= 1) { // if still have a slot
                assignment.value.a.push(id)
            } else { // if the slot is full
                $toast.error('Remove existing assignments before adding new ones', { position: 'top', duration: 10000 })
                added = false
            }

            await assignStore.upsert(assignment.value)
            await handlePrayers(id, added)

        } else {
            // single assignment parts
            assignment.value.a = (assignment.value.a == id) ? '' : id
            added = assignment.value.a !== ''
            await assignStore.upsert(assignment.value)
            await handleAutofills(id);
            await handleS140Prayer(id, added);
        }
    }


    async function handleAutofills(id: string): Promise<void> {
        if (part.autofills) {
            for (const af of part.autofills) {
                await assignStore.upsert({
                    pid: af, a: id,
                })
            }
        }
    }

    /**
     * Handling prayer assignment on S-140 template
    */
    async function handleS140Prayer(id: string, isAdded: boolean): Promise<void> {

        if (isOpenPrayer.value || isClosingPrayer.value) {
            const weekId = getWeekId(part.id)
            let a100Prayer = assignStore.get.find(p => p.pid == weekId)

            if (!a100Prayer)
                a100Prayer = { pid: weekId || '', a: ['', ''] }

            if (Array.isArray(a100Prayer.a)) {
                if (isOpenPrayer.value) a100Prayer.a[0] = isAdded ? id ?? '' : ''
                if (isClosingPrayer.value && isAdded) a100Prayer.a[1] = isAdded ? id ?? '' : ''
            }
            await assignStore.upsert(a100Prayer);
        }
    }

    /**
     * Handling prayer assignment on a customed template
    */
    async function handlePrayers(id: string, isAdded: boolean): Promise<void> {
        if (arePrayers.value) {
            const weekId = getWeekId(part.id + '.1')
            const i = assignment.value.a.indexOf(id)
            const prayer = { pid: '', a: '' }

            if (isAdded) {
                if (i === 0) prayer.pid = weekId + '.op'
                if (i === 1) prayer.pid = weekId + '.cp'
                prayer.a = id
                await assignStore.upsert(prayer);
            } else {
                const p = assignStore.get.find(pry => (pry.pid.includes('.op') || pry.pid.includes('.cp')) && pry.a == id)
                if (p) assignStore.remove(p.pid)
            }
        }
    }

    function getWeekId(partId: string): string | null {
        const regex = /^(\d+\.\d+)\.+/;
        const match = partId.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Prepares whether the assignment.a is string or string[]
    */
    function prepAssignment(): void {
        if (isDemo.value || areInterpreters.value || isBibleReading.value || isTalk.value || arePrayers.value) {
            assignment.value = { pid: part.id, a: [] }
        } else {
            assignment.value = { pid: part.id, a: '' }
        }
    }

    function blurredSelector(event: MouseEvent): void {
        if (triggered) {
            emits("trigger-off");
            mouseYpos.value = event.clientY
            mouseXpos.value = event.clientX
            setOnA100Position()
            setMyTransform()
            return;
        }

        if (assignSelector.value && !assignSelector.value.contains(event.target as HTMLElement)) {
            emits('hide')
        }
    };

    function setOnA100Position(): void {
        const viewportWidth = window.innerWidth;
        const per = Math.round(mouseXpos.value / viewportWidth * 100)
        a100Pos.value = per > 60 ? 'right' : 'left'
    }

    function setMyTransform(): void {
        if (!assignSelector.value) return

        const rect = assignSelector.value.getBoundingClientRect() as DOMRect;

        const viewportHeight = window.innerHeight;
        const bottomOverflowLimit = 30
        const topOverflowLimit = 65
        const hasBottomOverflow = (viewportHeight - rect.bottom) < bottomOverflowLimit

        if (hasBottomOverflow) {
            const diff = viewportHeight - rect.bottom;
            assignSelector.value.style.transform = `translateY(50%)`
            assignSelector.value.style.bottom = `${-diff + bottomOverflowLimit}px`;
            const rectAfter = assignSelector.value.getBoundingClientRect() as DOMRect;
            moveWrapperArrow(rectAfter.y + rectAfter.height)
            return
        }

        const isBelowTopLimit = (rect.y < topOverflowLimit)
        if (isBelowTopLimit) {
            const diff = rect.y - topOverflowLimit
            assignSelector.value.style.transform = `translateY(-50%) translateY(${-diff}px)`;
            const rectAfter = assignSelector.value.getBoundingClientRect() as DOMRect;
            moveWrapperArrow(rectAfter.y + rectAfter.height)
        }
    }

    function moveWrapperArrow(parentY: number) {
        if (!arrow.value) return

        const rect = arrow.value.getBoundingClientRect() as DOMRect;
        const arrMidPos = rect.top + (rect.height / 2)
        const difFromMouse = arrMidPos - (mouseYpos.value ?? 0)
        arrow.value.style.top = `calc(43% + ${-difFromMouse}px)`

        const afterRect = arrow.value.getBoundingClientRect() as DOMRect;
        const newArrowBottom = afterRect.y - afterRect.height + 50

        if (newArrowBottom > parentY || (mouseYpos.value ?? 0) < 85)
            arrow.value.style.display = 'none'
    }


    function loadAssigned(): void {
        const partId: string = part?.id ?? '';
        const assigned = assignStore.get.find(a => a.pid == partId);
        if (assigned) {
            // makes sure that missing pubs are removed
            if (Array.isArray(assigned.a)) {
                for (const id of assigned.a) {
                    const pubExist = pubStore.publishers.some(p => p.id == id)
                    if (!pubExist) assigned.a = assigned.a.filter(i => i != id)
                }
            }
            assignment.value = { pid: part.id, a: assigned.a }
        }
    }

    onMounted(() => {
        prepAssignment()
        loadAssigned()
        document.addEventListener('click', blurredSelector);
    })

    onUnmounted(() => {
        document.removeEventListener('click', blurredSelector);
    })
</script>

<style scoped>
    .assign-selector
    {
        position: absolute;
        min-width: 325px;
        width: auto;
        color: black;
        height: 350px;
        min-height: 100px;
        max-height: 400px;
        background: #ffff;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
        padding: 15px 15px;
        z-index: 1;
        transform: translateY(-50%);
        overflow: visible;
        font-size: 16px;
        border-radius: 3px;
        transition: fade 1s;
    }

    .ons140
    {
        right: calc(100%);
    }

    .ona100-left
    {
        right: calc(108%);
    }

    .ona100-right
    {
        left: calc(108%);
    }

    .wrapper
    {
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
    }

    .arrow
    {
        position: absolute;
        background: white;
        height: 20px;
        width: 20px;
        top: 43%;
        content: "";
        transform: rotate(45deg);
        z-index: -3;
    }

    .arrow-right
    {
        right: -20.5px;
    }

    .arrow-left
    {
        left: -20.5px;
    }

    .filter
    {
        width: 100%;
        border: none;
        border-bottom: 1px solid rgba(128, 128, 128, 0.733);
        padding: 10px 10px 5px;
        font-size: .9em;
        background: rgba(235, 235, 235, 0.336);
        margin-bottom: 10px;
        outline: none;
    }

    .list-options-wrapper
    {
        overflow-y: auto;
        flex: 1;
    }

    .list
    {
        display: flex;
        flex-direction: column;
        overflow: auto;
        gap: 4px;
        padding-top: 5px;
    }


</style>