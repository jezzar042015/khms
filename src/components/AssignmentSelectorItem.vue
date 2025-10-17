<template>
    <div :class="['item', { active: isAssigned(person.id) }]" @click.stop="setAssignment(person.id ?? '')">
        <p>{{ person.name }} <span v-show="showAgo" class="ago">{{ lastDate }}w</span></p>
        <span class="demo-desc">
            {{ studentOrAssistant(person.id) }}
        </span>
    </div>
</template>

<script setup lang="ts">
    import { useAssignmentHistoryStore } from '@/stores/assignment-history';
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
    const history = useAssignmentHistoryStore()
    const setAssignment = (id: string) => emits('set-assignment', id)

    const lastDate = computed(() => {
        if (!person.id) return 0
        const isBibleReading = assignment.pid.endsWith('.3') || assignment.pid.endsWith('.3.ax1')
        const prevParts = isBibleReading ? history.bibleReaders[person.id] : history.ayfmStudents[person.id]
        return prevParts ? weeksFromCurrent(prevParts[0]) : 0
    })

    const showAgo = computed(() => {
        return Array.isArray(assignment.a) && !arePrayers && !areInterpreters && lastDate.value > 0
    })

    function weeksFromCurrent(code: string, today: Date = new Date()): number {
        // Parse input like "202510.1"
        const [ym, wStr] = code.split(".");
        const year = Number.parseInt(ym.slice(0, 4), 10);
        const month = Number.parseInt(ym.slice(4, 6), 10) - 1; // JS months are 0-indexed
        const week = Number.parseInt(wStr, 10);

        // Get first Monday of the target month
        const firstDay = new Date(year, month, 1);
        const dayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, ...
        const firstMonday =
            dayOfWeek === 1
                ? new Date(year, month, 1)
                : new Date(year, month, 1 + ((8 - dayOfWeek) % 7));

        // Calculate start date of the given week (Monday)
        const weekStart = new Date(firstMonday);
        weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);

        // Find Monday of current week
        const current = new Date(today);
        const currentDayOfWeek = current.getDay();
        const currentMonday = new Date(current);
        currentMonday.setDate(current.getDate() - ((currentDayOfWeek + 6) % 7));

        // Difference in full weeks
        const diffDays = Math.floor(
            (currentMonday.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
        );
        const diffWeeks = Math.floor(diffDays / 7) + 1; // +1 so current week = 1

        return diffWeeks;
    }

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

    .ago
    {
        background: rgb(236, 130, 130);
        color: #fff;
        padding: 1px 5px;
        font-size: 10px;
        border-radius: 10px;
        margin-left: 10px;
    }
</style>