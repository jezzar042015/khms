<template>
    <div class="row grid-col">
        <div>
            <span class="remove-pub" v-if="!isNewPub" @click="requestDelete">
                <IconMinus />
            </span>
            <input type="text" placeholder="Add publisher here" v-model="publisher.name" @blur="upsert"
                @keyup.enter="upsert">
        </div>
        <div class="roles">
            <span class="add-role" @click="showRoleSelector">
                <IconPlus />
                <RoleSelector v-if="roleSelectorDisplay" :publisher="publisher" :triggered="hasTriggeredSelector"
                    @hide-me="hideRoleSelector" @trigger-off="turnOffTrigger" />
            </span>
            <span :class="['role', { 'demo': role.code == 'demo' }]" v-for="role in rolesDisplay" :key="role.code">
                {{ role.display }}
                <span class="remove-role" v-if="role.code != 'demo'" @click="removeRole(role.code)">
                    <IconMinus />
                </span>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { usePublisherStore } from '@/stores/publisher';
    import { useViewStore } from '@/stores/views';
    import type { Publisher } from '@/types/publisher';

    import IconMinus from '@/components/icons/IconMinus.vue'
    import IconPlus from '@/components/icons/IconPlus.vue'
    import RoleSelector from '@/components/RoleSelector.vue'

    const roleSelectorDisplay = ref(false);

    const { pub } = defineProps<{
        pub: Publisher
    }>();

    const emits = defineEmits(['request-remove']);

    const hasTriggeredSelector = ref(false);
    const pubStore = usePublisherStore();
    const viewStore = useViewStore();

    const publisher = ref<Publisher>({
        id: pub.id,
        name: pub.name,
        roles: pub.roles
    });

    const isNewPub = computed<boolean>(() => typeof publisher.value.id === 'undefined');

    const rolesDisplay = computed<{ code: string, display: string }[]>(() => {
        const pubRoles = publisher.value.roles

        if (!pubRoles) return []
        const displays = []

        for (const code of pubRoles) {
            const role = rolesLibrary.value.find(r => r.code == code)
            if (role) displays.push({
                code: code,
                display: role.display
            })
        }

        return displays
    })

    const rolesLibrary = computed(() => {
        const specialRoles = pubStore.specialRoles
        const filtered = [];

        for (const role of specialRoles) {
            if (viewStore.cams && ['cam', 'intr'].includes(role.code))
                filtered.push(role)
        }

        return [...pubStore.roles, ...filtered]
    })

    function requestDelete() {
        emits('request-remove', publisher.value)
    }

    function showRoleSelector(): void {
        hasTriggeredSelector.value = true;
        roleSelectorDisplay.value = true;
    }

    function hideRoleSelector(): void {
        roleSelectorDisplay.value = false;
    }

    function turnOffTrigger(): void {
        hasTriggeredSelector.value = false;
    }

    async function upsert(): Promise<void> {
        if (!publisher.value.id && !publisher.value.name) return
        const mode = await pubStore.upsert(publisher.value)
        if (mode != 'insert') return

        publisher.value = {
            name: '',
            roles: ['demo'],
        }
    }

    async function removeRole(roleCode: string): Promise<void> {
        publisher.value.roles = publisher.value.roles.filter(r => r !== roleCode)
        await pubStore.upsert(publisher.value)
    }



</script>

<style scoped>
    .row
    {
        min-height: 2.3em;
        height: auto;
        font-size: .9em;
        padding: 2.5px 2.5px 2.5px 1.25em;
        border-bottom: 1px solid rgb(221, 221, 221);
        overflow: visible;
        position: relative;
    }

    .row input
    {
        width: 100%;
        padding: 3.5px 8px;
        border: none;
        outline: none;
        font-size: 1em;
        align-items: center;
    }

    .roles
    {
        display: inline-flex;
        flex-wrap: wrap;
        width: auto;
        gap: 4px;
        align-items: center;
        position: relative;
    }

    .role
    {
        display: inline-flex;
        gap: 3px;
        padding: 3px 10px 3px 10px;
        font-size: .80em;
        border: none;
        border-radius: 14px;
        background: rgb(238, 238, 238);
        color: rgb(107, 107, 107);
        cursor: pointer;
        user-select: none;
    }

    .add-role
    {
        display: inline-flex;
        padding: 2px;
        border-radius: 14px;
        font-size: .80em;
        background: rgb(238, 238, 238);
        cursor: pointer;
        transition: ease-in-out 2s;
        position: relative;
    }

    .add-role svg
    {
        height: 1.5em;
        opacity: .4;
        stroke: gray;
    }

    .remove-role
    {
        display: none;
        background: rgba(255, 211, 211, 0.616);
        border-radius: 50%;
        transition: ease-in .3s;
    }

    .remove-role svg
    {
        height: 1.3em;
        stroke: #ffff;
    }

    .role:hover .remove-role
    {
        display: flex;
    }

    .role:not(.demo):hover
    {
        padding-right: 4px;
    }

    .remove-role:hover
    {
        background: orangered;
    }

    .remove-pub
    {
        display: none;
        position: absolute;
        background: rgba(255, 68, 0, 0.151);
        left: 0;
        top: 5px;
        border-radius: 100%;
        cursor: pointer;
        transition: all .2s;
    }

    .remove-pub svg
    {
        height: 1.3em;
        stroke: #ffff;
    }

    .row:hover div .remove-pub
    {
        display: inline-flex;
    }

    .remove-pub:hover
    {
        background: rgba(255, 68, 0, 0.616);
    }
</style>