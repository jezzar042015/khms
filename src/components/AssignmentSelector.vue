<template>
    <div :class="selectorClasses" ref="assignSelector" @click.stop>
        <div class="wrapper">
            <span :class="arrowClasses" ref="arrow"></span>
            <div>
                <div class="desc">{{ titleDisplay }}</div>
                <div class="alias" v-if="!noAssignables">{{ participantAlias }}</div>
                <div class="noalias" v-else>
                    <p>No students or participants have been added yet that can be assigned for this part. Please check
                        the publishers
                        list:</p>
                    <ul>
                        <li>Has the publisher been added?</li>
                        <li>If added, do they have the correct roles assigned?</li>
                    </ul>

                    <button @click="viewStore.setView('pubs')">Check Publishers</button>

                </div>
            </div>
            <div v-if="longList">
                <input type="text" class="filter" placeholder="Filter" v-model="filter">
            </div>
            <div class="list-wrapper">
                <div class="list">
                    <div :class="['item', { active: isSelected(a.id) }]" v-for="a in filteredAssignables" :key="a.id"
                        @click.stop="setAssignment(a.id ?? '')">
                        {{ a.name }}
                        <span class="demo-desc">
                            {{ studentOrAssistant(a.id) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref } from 'vue';
    import { usePublisherStore } from '@/stores/publisher';
    import { useAssignmentStore } from '@/stores/assignment';
    import { useViewStore } from '@/stores/views';
    import { useCongregationStore } from '@/stores/congregation';
    import type { S140PartItem, PartItem } from '@/types/files';
    import type { Publisher } from '@/types/publisher';
    import type { MWBAssignment } from '@/types/mwb';

    type A100Position = 'right' | 'left'
    const emits = defineEmits(['hide', 'trigger-off'])
    const pubStore = usePublisherStore()
    const assignStore = useAssignmentStore()
    const viewStore = useViewStore()
    const congStore = useCongregationStore()

    const filter = ref('')
    const assignment = ref<MWBAssignment>({
        pid: '', a: ''
    })

    const mouseYpos = ref<number>(0)
    const mouseXpos = ref<number>(0)
    const a100Pos = ref<A100Position>('right')

    const props = defineProps<{
        part: S140PartItem | PartItem,
        triggered: boolean,
    }>()

    const assignSelector = ref<HTMLElement | null>(null)
    const arrow = ref<HTMLElement | null>(null)

    const participantAlias = computed<string>(() => {
        if (noAssignables.value) return 'No Assignables';

        const roles = props.part.roles || [];

        if (roles.includes('demo')) {
            return 'Select Students';
        } else if (roles.includes('prayers')) {
            return 'Select brothers to pray'
        } else if (roles.includes('talk')) {
            return 'Select Talk Student';
        } else if (roles.includes('cbs')) {
            return 'Select Conductor';
        } else if (roles.includes('br')) {
            return 'Select Student Reader';
        } else if (roles.includes('rdr')) {
            return 'Select Reader';
        } else if (roles.includes('cam')) {
            return 'Select Camera Operator';
        } else if (roles.includes('intr')) {
            return 'Select Interpreters';
        } else if (roles.includes('elder') || roles.includes('ms')) {
            return 'Select brother to handle';
        } else {
            return 'Select ...';
        }
    });

    const selectorClasses = computed<string>(() => {
        const is140 = congStore.congregation.mwbTemplate == 's-140'
        const a100Class = a100Pos.value === 'left' ? ' ona100-right' : ' ona100-left';
        return 'assign-selector' + (is140 ? ' ons140' : a100Class)
    })

    const arrowClasses = computed<string>(() => {
        const is140 = congStore.congregation.mwbTemplate == 's-140'
        const a100Class = a100Pos.value === 'left' ? ' arrow-left' : ' arrow-right';
        return 'arrow' + (is140 ? ' arrow-right' : a100Class)
    })

    const isOpenPrayer = computed<boolean>(() => {
        return props.part.id.endsWith('.op')
    })

    const isClosingPrayer = computed<boolean>(() => {
        return props.part.id.endsWith('.cp')
    })

    const titleDisplay = computed<string>(() => {
        if (isOpenPrayer.value) return 'Opening Prayer'
        if (isClosingPrayer.value) return 'Closing Prayer'

        return props.part.title ?? ''
    })

    const filteredAssignables = computed<Publisher[]>(() => {
        if (!filter.value) return assignables.value
        const f = filter.value.toLowerCase()
        return assignables.value.filter(pub => pub.name.toLowerCase().includes(f))
    })

    const assignables = computed<Publisher[]>(() => {
        if (!props.part.roles) return pubStore.publishers

        const list = pubStore.publishers.filter(publisher =>
            publisher.roles.some(role => props.part.roles?.includes(role))
        )

        return list.sort((a, b) => {
            const pa = +(assignment.value.a?.includes(a.id || '') || false);
            const pb = +(assignment.value.a?.includes(b.id || '') || false);
            return pb - pa;
        });
    })

    const noAssignables = computed<boolean>(() => {
        return assignables.value.length === 0
    })

    const longList = computed<boolean>(() => {
        return assignables.value.length > 8
    })

    const studentOrAssistant = (pubId: string | undefined): string | null => {
        if (!Array.isArray(assignment.value.a) || arePrayers.value || areInterpreters.value) {
            return null;
        }

        const index = assignment.value.a.indexOf(pubId ?? '');
        let result: string | null = null;

        if (index === 0) {
            result = 'Student';
        } else if (index > 0) {
            result = 'Assistant';
        }

        return result;
    }

    const isDemo = computed(() => props.part.roles?.includes('demo'))
    const isBibleReading = computed(() => props.part.roles?.includes('br'))
    const isTalk = computed(() => props.part.roles?.includes('talk'))
    const arePrayers = computed(() => props.part.roles?.includes('prayers'))
    const areInterpreters = computed(() => props.part.roles?.includes('intr'))

    function isSelected(pubId: string | undefined): boolean {
        if (!pubId || !assignment.value) return false
        if (typeof assignment.value.a === 'string') {
            return pubId === assignment.value.a
        } else {
            return assignment.value.a.includes(pubId)
        }
    }

    async function setAssignment(id: string): Promise<void> {

        let added: boolean = true;

        if ((isDemo.value || arePrayers.value || areInterpreters.value || isBibleReading.value || isTalk.value) && Array.isArray(assignment.value.a)) {
            if (assignment.value.a.includes(id)) {
                added = false
                assignment.value.a = assignment.value.a.filter(a => a != id)
            } else if (assignment.value.a.length <= 1) {
                assignment.value.a.push(id)
            } else {
                added = false
            }

            await assignStore.upsert(assignment.value)
            await handlePrayers(id, added)
        } else {
            assignment.value.a = (assignment.value.a == id) ? '' : id
            added = assignment.value.a !== ''
            await assignStore.upsert(assignment.value)
            await handleAutofills(id);
            await handleS140Prayer(id, added);
        }
    }

    async function handleAutofills(id: string): Promise<void> {
        if (props.part.autofills) {
            for (const af of props.part.autofills) {
                await assignStore.upsert({
                    pid: af, a: id,
                })
            }
        }
    }

    async function handleS140Prayer(id: string, isAdded: boolean): Promise<void> {

        if (isOpenPrayer.value || isClosingPrayer.value) {
            const weekId = getWeekId(props.part.id)
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

    async function handlePrayers(id: string, isAdded: boolean): Promise<void> {
        if (arePrayers.value) {
            const weekId = getWeekId(props.part.id + '.1')
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

    function prepAssignment(): void {
        if (isDemo.value || areInterpreters.value || isBibleReading.value || isTalk.value || arePrayers.value) {
            assignment.value = { pid: props.part.id, a: [] }
        } else {
            assignment.value = { pid: props.part.id, a: '' }
        }
    }

    function blurredSelector(event: MouseEvent): void {
        if (props.triggered) {
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
        const partId: string = props.part?.id ?? '';
        const assigned = assignStore.get.find(a => a.pid == partId);
        if (assigned) {
            // makes sure that missing pubs are removed
            if (Array.isArray(assigned.a)) {
                for (const id of assigned.a) {
                    const pubExist = pubStore.publishers.some(p => p.id == id)
                    if (!pubExist) assigned.a = assigned.a.filter(i => i != id)
                }
            }
            assignment.value = { pid: props.part.id, a: assigned.a }
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

    .alias
    {
        padding: 4px 0;
        font-size: .95em;
    }

    .noalias
    {
        padding: 10px;
    }

    .noalias ul
    {
        padding: 10px 10px 10px 20px;
    }

    .desc
    {
        font-size: .8em;
        padding-bottom: 10px;
        position: relative;
    }

    .desc::before
    {
        content: "";
        position: absolute;
        width: 100px;
        height: 4px;
        background: #3da8ea7a;
        z-index: -1;
        bottom: 2px;
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

    .list-wrapper
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

    .item
    {
        font-size: .95em;
        padding: 5px 8px;
        border-left: 5px solid rgba(197, 197, 197, 0.247);
        color: rgb(77, 77, 77);
        position: relative;
        cursor: pointer;
    }


    .item:hover,
    .active
    {
        color: black;
        font-weight: 600;
    }

    .item:not(.active):hover
    {
        border-left: 5px solid #3da8ea27;
    }

    .active
    {
        border-left: 5px solid #3da8ea7a;
    }

    .demo-desc
    {
        font-size: .84em;
        position: absolute;
        right: 10px;
        top: 5px;
        min-width: 100px;
        font-weight: 400;
        color: gray;
        padding-left: 15px;
    }

    .demo-desc:not(:empty)::before
    {
        content: "";
        position: absolute;
        height: 6px;
        width: 6px;
        background: #3da8ea7a;
        border-radius: 100%;
        left: 0;
        top: 40%;
    }

    button
    {
        background: #3DA8EA;
        border: none;
        color: white;
        font-size: 12px;
        padding: 10px 25px;
        border-radius: 50px;
        cursor: pointer;
        transition: ease-in-out .5s;
        margin-top: 10px;
    }

    button:hover
    {
        background: #2878aa;
    }
</style>