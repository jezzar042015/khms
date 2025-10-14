<template>
    <div>
        <div class="desc">{{ titleDisplay }}</div>
        <div class="alias" v-if="!noAssignables">{{ participantAlias }}</div>
        <div class="noalias" v-else>
            <p>No students or participants have been added yet who can be assigned to this part. Please check
                the publishers list:</p>
            <ul>
                <li>Has the publisher been added?</li>
                <li>If they have been added, do they have the correct roles assigned?</li>
            </ul>

            <button @click="viewStore.setView('pubs')">Check Publishers</button>

        </div>
    </div>
</template>

<script setup lang="ts">
    import { useViewStore } from '@/stores/views';
    import type { PartItem, S140PartItem } from '@/types/files';
    import { computed } from 'vue'

    const { noAssignables, part, isOpenPrayer, isClosingPrayer } = defineProps<{
        noAssignables: boolean
        part: S140PartItem | PartItem
        isOpenPrayer: boolean
        isClosingPrayer: boolean
    }>()

    const viewStore = useViewStore()

    const titleDisplay = computed<string>(() => {
        if (isOpenPrayer) return 'Opening Prayer'
        if (isClosingPrayer) return 'Closing Prayer'

        return part.title ?? ''
    })

    const participantAlias = computed<string>(() => {
        if (noAssignables) return 'No Assignables';

        const roles = part.roles || [];

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
</script>

<style scoped>
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
</style>