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
        return 'assign-selector' + (is140 ? ' ons140' : 'ona100')
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

    function setOnA100Position(): void {
        const viewportWidth = window.innerWidth;
        const parentX = selector.rect?.x ?? 0
        const per = Math.round(parentX / viewportWidth * 100)
        a100Pos.value = per > 60 ? 'right' : 'left'
    }

    /**
     * AssignmentSelector positioning handler 
     * */

    function setMyTransform(): void {
        const is140 = congStore.congregation.mwbTemplate == 's-140'

        if (is140) {
            setMyTransformOnS140()
        } else {
            setMyTransformOnA100()
        }
    }

    /**
     * AssignmentSelector positioning is relative to #s140 
     * */
    function setMyTransformOnA100(): void {
        if (!assignSelector.value || !selector.rect) return;

        const container = document.getElementById('template-bg');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const actualTop = selector.rect.top - containerRect.top + scrollTop;

        // check which column for normal-part, prayers, technical
        setOnA100Position()
        // console.log('setMyTransformOnA100');
    }

    /**
     * AssignmentSelector positioning is relative to #s140 
     * */
    function setMyTransformOnS140(): void {

        if (!assignSelector.value || !selector.rect) return;

        const container = document.getElementById('template-bg');
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;

        const actualTop = selector.rect.top - containerRect.top + scrollTop;

        const isAuxiliary = selector.part?.id.endsWith('.ax1');

        const rightOffset = isAuxiliary
            ? selector.rect.width * 2
            : selector.rect.width;

        const gapX = 10;

        assignSelector.value.style.right = `${rightOffset + gapX}px`;

        const selectorHeight = assignSelector.value.offsetHeight;

        let top = Math.max(0, actualTop - selectorHeight);

        const bottomOverflowLimit = 100;
        const topOverflowLimit = 300;

        const selectorBottomInContainer = selector.rect.bottom + containerRect.top;

        const hasBottomOverflow =
            (containerHeight - selectorBottomInContainer) < bottomOverflowLimit;

        const hasTopOverflow = (selector.rect.top - containerRect.top) < topOverflowLimit;

        assignSelector.value.style.transform = '';

        if (hasBottomOverflow) {
            const correctedTop = scrollTop + containerHeight - selectorHeight - 132

            assignSelector.value.style.top = `${correctedTop}px`;
            assignSelector.value.style.bottom = '';

        }
        else if (hasTopOverflow && scrollTop > 0) {
            const correctedTop = scrollTop - 110;
            assignSelector.value.style.top = `${correctedTop}px`;
            assignSelector.value.style.transform = 'translateY(10%)';
        }
        else {
            assignSelector.value.style.top = `${top}px`;
        }
    }

    function moveWrapperArrow() {
        if (!arrow.value) return

        const selectorRect = assignSelector.value?.getBoundingClientRect()
        const parentY = (selector.rect?.y ?? 0) - (selectorRect?.top ?? 0)

        arrow.value.style.top = `${parentY - 10}px`
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
            await nextTick() // wait for DOM to update so the template ref is populated
            setMyTransform()
            moveWrapperArrow()
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