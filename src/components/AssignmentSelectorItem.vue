<template>
    <div :class="['item', { active: isAssigned(person.id) }]" @click.stop="setAssignment(person.id ?? '')">
        <p>
            {{ person.name }}
            <span v-show="showAgo" class="ago">
                {{ ago }}</span>
        </p>

        <!-- Labels what assignment on array parts -->
        <span class="demo-desc">
            {{ studentOrAssistant(person.id) }}
        </span>
    </div>
</template>

<script setup lang="ts">
    import type { MWBAssignment } from '@/types/mwb'
    import type { Publisher } from '@/types/publisher';
    import { computed } from 'vue';

    const { person, arePrayers, areInterpreters, assignment } = defineProps<{
        person: Publisher
        arePrayers: boolean
        areInterpreters: boolean
        assignment: MWBAssignment
    }>()

    const emits = defineEmits(['set-assignment'])
    const setAssignment = (id: string) => emits('set-assignment', id)


    const showAgo = computed(() => {
        return Array.isArray(assignment.a) &&
            !arePrayers &&
            !areInterpreters &&
            // (person.weeksSinceLastAssignment ?? 0) !== 0 &&
            !assignment.a.includes(person.id ?? '')
    })


    const ago = computed(() => {
        const w = person.weeksSinceLastAssignment
        if (w === undefined) return 'No previous'
        if (w < 0) return `Next ${Math.abs(w)}w`
        return `${w}w ago`
    })

    /**
    * @description determines if a publisher's name is already assigned 
    * to the part. 
    * @returns (boolean)
   */
    function isAssigned(pubId: string | undefined): boolean {
        if (!pubId || !assignment) return false
        if (typeof assignment.a === 'string') {
            return pubId === assignment.a
        } else {
            return assignment.a.includes(pubId)
        }
    }

    /**
     * @description provides a label if the assigned student is the main Student or an Assistant
     *  if the position of the student id 
     * @returns (string)
    */
    const studentOrAssistant = (pubId: string | undefined): string | null => {
        if (!Array.isArray(assignment.a) || arePrayers || areInterpreters) {
            return null;
        }

        const index = assignment.a.indexOf(pubId ?? '');
        let result: string | null = null;

        if (index === 0) {
            result = 'Student';
        } else if (index > 0) {
            result = 'Assistant';
        }

        return result;
    }

</script>

<style scoped>
    .item
    {
        font-size: .95em;
        padding: 5px 8px;
        border-left: 5px solid rgba(197, 197, 197, 0.247);
        color: rgb(77, 77, 77);
        position: relative;
        cursor: pointer;
    }

    .item p
    {
        display: flex;
        align-items: center;
        gap: 0px 10px;
        flex-wrap: wrap;
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
        top: 6px;
        min-width: 70px;
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

    .ago
    {
        display: inline-block;
        background: white;
        border: 1px solid rgb(245, 197, 197);
        color: rgb(250, 92, 92) !important;
        padding: 1px 5px;
        font-size: 10px !important;
        border-radius: 10px;
    }
</style>