<template>
    <div class="assign-selector" ref="assignSelector">
        <div class="wrapper">
            <div>
                <div class="desc">{{ part.title }}</div>
                <div class="alias">{{ participantAlias }}</div>
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
    import type { S140PartItem } from '@/types/files';
    import type { Publisher } from '@/types/publisher';
    import type { MWBAssignment } from '@/types/mwb';

    const emits = defineEmits(['hide', 'triggerOff'])
    const pubStore = usePublisherStore()
    const assignStore = useAssignmentStore()
    const filter = ref('')
    const assignment = ref<MWBAssignment>()

    const props = defineProps<{
        part: S140PartItem,
        triggered: boolean,
    }>()

    const assignSelector = ref<HTMLElement | null>(null)

    const participantAlias = computed<string>(() => {
        let desc: string = 'Select ...';
        if (props.part.roles?.includes('demo')) {
            desc = 'Select Students'
        } else if (props.part.roles?.includes('talk')) {
            desc = 'Select Talk Student'
        } else if (props.part.roles?.includes('cbs')) {
            desc = 'Select Conductor'
        } else if (props.part.roles?.includes('br')) {
            desc = 'Select Student Reader'
        } else if (props.part.roles?.includes('elder') || props.part.roles?.includes('ms')) {
            desc = 'Select brother to handle'
        }
        return desc;
    })

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

    function blurredSelector(event: Event): void {
        if (props.triggered) {
            emits("triggerOff");
            return;
        }

        if (assignSelector.value && !assignSelector.value.contains(event.target as HTMLElement)) {
            emits('hide')
        }
    };

    onMounted(() => {
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

    .wrapper::after
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
</style>