<template>
    <div class="assign-selector" ref="assignSelector">
        <div class="wrapper">
            <span class="arrow" ref="arrow"></span>
            <div>
                <div class="desc">{{ part.title }}</div>
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
                        @click="setAssignment(a.id ?? '')">
                        {{ a.name }}
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
    import type { S140PartItem } from '@/types/files';
    import type { Publisher } from '@/types/publisher';
    import type { MWBAssignment } from '@/types/mwb';

    const emits = defineEmits(['hide', 'triggerOff'])
    const pubStore = usePublisherStore()
    const assignStore = useAssignmentStore()
    const viewStore = useViewStore()
    const filter = ref('')
    const assignment = ref<MWBAssignment>()
    const mouseYpos = ref<number>()

    const props = defineProps<{
        part: S140PartItem,
        triggered: boolean,
    }>()

    const assignSelector = ref<HTMLElement | null>(null)
    const arrow = ref<HTMLElement | null>(null)

    const participantAlias = computed<string>(() => {
        if (noAssignables.value) return '';

        const roles = props.part.roles || [];

        if (roles.includes('demo')) {
            return 'Select Students';
        } else if (roles.includes('talk')) {
            return 'Select Talk Student';
        } else if (roles.includes('cbs')) {
            return 'Select Conductor';
        } else if (roles.includes('br')) {
            return 'Select Student Reader';
        } else if (roles.includes('rdr')) {
            return 'Select Reader';
        } else if (roles.includes('elder') || roles.includes('ms')) {
            return 'Select brother to handle';
        } else {
            return 'Select ...';
        }
    });


    const filteredAssignables = computed<Publisher[]>(() => {
        if (!filter.value) return assignables.value
        const f = filter.value.toLowerCase()
        return assignables.value.filter(pub => pub.name.toLowerCase().includes(f))
    })

    const assignables = computed<Publisher[]>(() => {
        if (!props.part.roles) return pubStore.publishers

        return pubStore.publishers.filter(publisher =>
            publisher.roles.some(role => props.part.roles?.includes(role))
        )
    })

    const noAssignables = computed<boolean>(() => {
        return assignables.value.length === 0
    })

    const longList = computed<boolean>(() => {
        return assignables.value.length > 8
    })

    function isSelected(pubId: string | undefined): boolean {
        if (!pubId || !assignment.value) return false
        if (typeof assignment.value.a === 'string') {
            return pubId === assignment.value.a
        } else {
            return false
        }
    }

    async function setAssignment(id: string): Promise<void> {
        const isDemo = props.part.roles?.includes('demo')

        if (isDemo) {
            assignment.value = { pid: props.part.id, a: [] }
            console.log(assignment.value);
        } else {
            assignment.value = { pid: props.part.id, a: id }
            await assignStore.upsert(assignment.value)

            if (!props.part.autofills) return

            for (const af of props.part.autofills) {
                await assignStore.upsert({
                    a: id, pid: af
                })
            }
        }
    }

    function prepAssignment(): void {
        const isDemo = props.part.roles?.includes('demo')
    }

    function blurredSelector(event: MouseEvent): void {
        if (props.triggered) {
            mouseYpos.value = event.clientY
            setMyTransform()
            emits("triggerOff");
            return;
        }

        if (assignSelector.value && !assignSelector.value.contains(event.target as HTMLElement)) {
            emits('hide')
        }
    };

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
        if (!assigned) return
        if (typeof assigned.a === 'string')
            assignment.value = { pid: props.part.id, a: assigned.a }
    }

    onMounted(() => {
        loadAssigned()
        prepAssignment()
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
        height: 350px;
        min-height: 100px;
        max-height: 400px;
        background: #ffff;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
        padding: 15px 15px;
        z-index: 1;
        right: calc(100%);
        transform: translateY(-50%);
        overflow: visible;
        font-size: 16px;
        border-radius: 3px;
        transition: fade 1s;
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
        right: -20.5px;
        top: 43%;
        content: "";
        transform: rotate(45deg);
        z-index: -3;
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
    }

    .item:hover,
    .active
    {
        color: black;
        font-weight: 600;
        border-left: 5px solid #3da8ea7a;
    }

    .temp
    {
        font-size: .6em
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