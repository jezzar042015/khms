<template>
    <div v-show="selector.show" :class="selectorClasses" ref="assignSelector" @click.stop>
        <div class="wrapper">
            <span :class="arrowClasses" ref="arrow"></span>

            <assignment-selector-header v-if="selector.part" :part="selector.part" :is-closing-prayer="isClosingPrayer"
                :is-open-prayer="isOpenPrayer" :no-assignables="noAssignables" />

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

    import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import { useAssignmentHistoryStore } from '@/stores/assignment-history';
    import { useAssignmentSelector } from '@/stores/assignment-selector';
    import { useCongregationStore } from '@/stores/congregation';
    import { useFilesStore } from '@/stores/files';
    import { usePublisherStore } from '@/stores/publisher';
    import { useToast } from 'vue-toast-notification';
    import { onClickOutside } from '@vueuse/core';
    import type { Publisher } from '@/types/publisher';
    import type { MWBAssignment } from '@/types/mwb';
    import AssignmentSelectorItem from './AssignmentSelectorItem.vue'
    import AssignmentSelectorHeader from './AssignmentSelectorHeader.vue'

    type A100Position = 'right' | 'left'
    const pubStore = usePublisherStore()
    const assignStore = useAssignmentStore()
    const historyStore = useAssignmentHistoryStore()
    const congStore = useCongregationStore()
    const fileStore = useFilesStore()
    const selector = useAssignmentSelector()

    const $toast = useToast();
    const filter = ref('')
    const assignment = ref<MWBAssignment>({
        pid: '', a: ''
    })

    const mouseYpos = ref<number>(0)
    const mouseXpos = ref<number>(0)
    const a100Pos = ref<A100Position>('right')


    const assignSelector = useTemplateRef('assignSelector')
    const arrow = ref<HTMLElement | null>(null)

    onClickOutside(assignSelector, () => (selector.show = false));

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
        return selector.part ? selector.part.id.endsWith('.op') : false
    })

    const isClosingPrayer = computed<boolean>(() => {
        return selector.part ? selector.part.id.endsWith('.cp') : false
    })

    /**
     * @description array of assignable publishers filtered by the part's required roles
     * @description the return is an array sorted by names
     * @returns (Publisher[])
    */
    const assignables = computed<Publisher[]>(() => {
        if (!selector.part) return []
        if (!selector.part.roles) return pubStore.publishers

        const list = pubStore.publishers.filter(publisher =>
            publisher.roles.some(role => selector.part ? selector.part.roles?.includes(role) : [])
        )

        const studentparts = new Set(["demo", "br", "talk"])
        const isStudentPart = selector.part.roles.some(r => studentparts.has(r))

        // Exclude publishers who already have assignments this week for student parts
        const filteredList = isStudentPart
            ? list.filter(p => !hasAssignments.value.includes(p.id ?? ''))
            : list

        // Here assign the number of weeks from previous assignment
        const weekId = assignment.value.pid.substring(0, 8)
        if (isStudentPart) {
            for (const item of filteredList) {
                if (item.id) {
                    const prevParts = isBibleReading.value ? historyStore.bibleReaders[item.id] : historyStore.ayfmStudents[item.id]
                    item.weeksSinceLastAssignment = prevParts ? weeksBetween(prevParts[0], weekId) : undefined
                }
            }
        }

        return filteredList.sort((a, b) => {
            const assignedIds = assignment.value.a || []

            // Step 1: prioritize those currently assigned
            const aIndex = assignedIds.indexOf(a.id || '')
            const bIndex = assignedIds.indexOf(b.id || '')
            const aAssigned = aIndex !== -1
            const bAssigned = bIndex !== -1

            if (aAssigned && !bAssigned) return -1
            if (!aAssigned && bAssigned) return 1

            // ✅ If both are assigned, follow the order in assignedIds array
            if (aAssigned && bAssigned) return aIndex - bIndex

            // Step 2: bring those with weeksSinceLastAssignment == undefined to the top
            const aSpecial = a.weeksSinceLastAssignment === undefined ? 1 : 0
            const bSpecial = b.weeksSinceLastAssignment === undefined ? 1 : 0
            if (bSpecial !== aSpecial) return bSpecial - aSpecial

            // Step 3: sort remaining by weeksSinceLastAssignment descending
            const wa = a.weeksSinceLastAssignment ?? -Infinity
            const wb = b.weeksSinceLastAssignment ?? -Infinity
            return wb - wa
        })
    })

    function weeksBetween(targetCode: string, baseCode: string): number {

        const targetMonday = getMonday(targetCode);
        const baseMonday = getMonday(baseCode);

        // Difference in full weeks (no +1)
        const diffDays = Math.floor(
            (baseMonday.getTime() - targetMonday.getTime()) / (1000 * 60 * 60 * 24)
        );
        const diffWeeks = Math.floor(diffDays / 7);

        return diffWeeks;
    }

    /**
     * Get's the first monday of the given week id code
     * */
    const getMonday = (code: string): Date => {
        const [ym, wStr] = code.split(".");
        const year = Number.parseInt(ym.slice(0, 4), 10);
        const month = Number.parseInt(ym.slice(4, 6), 10) - 1;
        const week = Number.parseInt(wStr, 10);

        const firstDay = new Date(year, month, 1);
        const dayOfWeek = firstDay.getDay();
        const firstMonday =
            dayOfWeek === 1
                ? new Date(year, month, 1)
                : new Date(year, month, 1 + ((8 - dayOfWeek) % 7));

        const monday = new Date(firstMonday);
        monday.setDate(firstMonday.getDate() + (week - 1) * 7);

        return monday;
    }

    /**
     * @description array of publishers already has assigned part this week
     * @returns (string[])
    */
    const hasAssignments = computed(() => {
        if (!selector.part) return []
        const weekId = selector.part.id.substring(0, 8) ?? ''

        const studentPartIds = new Set(
            fileStore.studentsParts
                .filter(s => s.id.startsWith(weekId))
                .map(m => m.id)
        );

        let currentAssigned: string[] = [];
        if (Array.isArray(assignment.value.a)) {
            currentAssigned = assignment.value.a.filter(Boolean);
        } else if (assignment.value.a) {
            currentAssigned = [assignment.value.a];
        }

        return Array.from(new Set(
            assignStore.get
                .filter(s => studentPartIds.has(s.pid))
                .flatMap(s => Array.isArray(s.a) ? s.a : [s.a])
                .filter(Boolean)
                .filter(id => !currentAssigned.includes(id as string))
        ));
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

    const isDemo = computed(() => selector.part?.roles?.includes('demo'))
    const isBibleReading = computed(() => selector.part?.roles?.includes('br'))
    const isTalk = computed(() => selector.part?.roles?.includes('talk'))
    const arePrayers = computed(() => selector.part?.roles?.includes('prayers') ?? false)
    const areInterpreters = computed(() => selector.part?.roles?.includes('intr') ?? false)

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

        historyStore.read()
    }


    async function handleAutofills(id: string): Promise<void> {
        if (selector.part?.autofills) {
            for (const af of selector.part.autofills) {
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
            const weekId = getWeekId(selector.part?.id || '')
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
            const weekId = getWeekId(selector.part?.id + '.1')
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
            assignment.value = { pid: selector.part?.id ?? '', a: [] }
        } else {
            assignment.value = { pid: selector.part?.id ?? '', a: '' }
        }
    }

    function blurredSelector(event: MouseEvent): void {
        //     if (triggered) {
        //         emits("trigger-off");
        //         mouseYpos.value = event.clientY
        //         mouseXpos.value = event.clientX
        //         setOnA100Position()
        //         setMyTransform()
        //         return;
        //     }

        //     if (assignSelector.value && !assignSelector.value.contains(event.target as HTMLElement)) {
        //         emits('hide')
        //     }
    };

    function setOnA100Position(): void {
        const viewportWidth = window.innerWidth;
        const per = Math.round(mouseXpos.value / viewportWidth * 100)
        a100Pos.value = per > 60 ? 'right' : 'left'
    }

    /**
     * AssignmentSelector positioning is relative to #s140 
     * */
    function setMyTransform(): void {
        // Early exit if selector or its target rectangle is missing
        if (!assignSelector.value || !selector.rect) return;

        // Get the scrollable container element (where positioning is relative)
        const container = document.getElementById('template-bg');
        if (!container) return;

        // Get container's position relative to viewport
        const containerRect = container.getBoundingClientRect();

        // Current vertical scroll within the container
        const scrollTop = container.scrollTop;

        // Visible height of the container
        const containerHeight = container.clientHeight;

        // --- Compute actual top position of target inside the scrollable container ---
        // selector.rect.top is relative to viewport, so we remove containerRect.top
        // to get position relative to the container, then add scrollTop to account for scrolling.
        const actualTop = selector.rect.top - containerRect.top + scrollTop;

        // --- Horizontal positioning (X-axis) ---
        // Determine if the target belongs to an auxiliary part
        const isAuxiliary = selector.part?.id.endsWith('.ax1');

        // Determine how far from the right side the selector should appear.
        // If it's auxiliary, place it farther (2× the width of the target element).
        const rightOffset = isAuxiliary
            ? selector.rect.width * 2
            : selector.rect.width;

        // Add small horizontal gap between selector and target element
        const gapX = 10;

        // Apply computed horizontal position (distance from container's right edge)
        assignSelector.value.style.right = `${rightOffset + gapX}px`;

        // --- Get selector height to determine Y positioning ---
        const selectorHeight = assignSelector.value.offsetHeight;

        // Start with default top position: place selector right above the target
        // Ensures it doesn't go above 0 (container top)
        let top = Math.max(0, actualTop - selectorHeight);

        // --- Overflow limits (for adjusting near edges) ---
        const bottomOverflowLimit = 50; // If closer than this to bottom, adjust upward
        const topOverflowLimit = 65;    // If closer than this to top, adjust downward

        // Distance from container’s top to target’s bottom
        const selectorBottomInContainer = selector.rect.bottom - containerRect.top;

        // Detect if selector would overflow the container’s bottom or top bounds
        const hasBottomOverflow =
            (containerHeight - selectorBottomInContainer) < bottomOverflowLimit;
        const hasTopOverflow = (selector.rect.top - containerRect.top) < topOverflowLimit;

        // Reset transform to prevent previous adjustments from accumulating
        assignSelector.value.style.transform = '';

        // --- CASE 1: Bottom overflow — near bottom of screen ---
        if (hasBottomOverflow) {
            // Get full viewport height (not just container)
            const viewportHeight = window.innerHeight;

            // Recalculate container position (in case of scroll)
            const containerRect = container.getBoundingClientRect();

            // Position of the target’s bottom relative to viewport
            const targetBottomInViewport = selector.rect.bottom;

            // Available space between target bottom and viewport bottom
            const spaceBelow = viewportHeight - targetBottomInViewport;

            // Compute how far we need to shift up to keep selector visible
            // “10” means we want it to stay at least 10px above screen bottom
            const overflowOffset = 10 - spaceBelow;

            // Compute corrected top position inside container
            // Shift upward by overflowOffset so it stays on-screen
            const correctedTop =
                selector.rect.top - containerRect.top + scrollTop - overflowOffset - 0;

            // Apply corrected top and remove any conflicting bottom positioning
            assignSelector.value.style.top = `${correctedTop}px`;
            assignSelector.value.style.bottom = '';

            // Move selector upward relative to target
            assignSelector.value.style.transform = 'translateY(-100%)';
        }
        // --- CASE 2: Top overflow — near top of screen ---
        else if (hasTopOverflow) {
            // Force position slightly below top edge
            const correctedTop = scrollTop + topOverflowLimit;

            // Apply top offset
            assignSelector.value.style.top = `${correctedTop}px`;

            // Add slight downward offset for better visual spacing
            assignSelector.value.style.transform = 'translateY(10%)';
        }
        // --- CASE 3: Normal position (no overflow) ---
        else {
            // Just place selector at calculated “top” above the target
            assignSelector.value.style.top = `${top}px`;
        }

        // --- Debug info (for developer logging) ---
        // Shows all the computed values that affect final selector position
        console.log({
            scrollTop,
            containerHeight,
            actualTop,
            hasBottomOverflow,
            hasTopOverflow,
            appliedTop: assignSelector.value.style.top,
            transform: assignSelector.value.style.transform,
        });
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
        const partId: string = selector.part?.id ?? '';
        const assigned = assignStore.get.find(a => a.pid == partId);
        if (assigned) {
            // makes sure that missing pubs are removed
            if (Array.isArray(assigned.a)) {
                for (const id of assigned.a) {
                    const pubExist = pubStore.publishers.some(p => p.id == id)
                    if (!pubExist) assigned.a = assigned.a.filter(i => i != id)
                }
            }
            assignment.value = { pid: selector.part?.id ?? '', a: assigned.a }
        }
    }

    watch(
        () => selector.part?.id,
        async () => {

            prepAssignment()
            loadAssigned()
            // wait for DOM to update so the template ref is populated
            await nextTick()
            setMyTransform()
        },
        {
            immediate: true,
            deep: true
        }
    )

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
        z-index: 2;
        overflow: visible;
        font-size: 16px;
        border-radius: 3px;
        transition: fade 1s;
    }

    .ons140
    {
        /* right: 0; */
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