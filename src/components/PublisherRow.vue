<template>
    <div class="row grid-col">
        <div><input type="text" placeholder="Add publisher here" v-model="publisher.name" @blur="upsert"
                @keyup.enter="upsert"></div>
        <div class="roles">
            <span class="role" v-for="role in rolesDisplay" :key="role">
                {{ role }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import type { Publisher } from '@/types/publisher';
    import { usePublisherStore } from '@/stores/publisher';

    const props = defineProps<{
        pub: Publisher
    }>()

    const pubStore = usePublisherStore()

    const publisher = ref<Publisher>({
        id: props.pub.id,
        name: props.pub.name,
        roles: props.pub.roles
    })

    const rolesDisplay = computed<string[]>(() => {
        const pubRoles = publisher.value.roles
        if (!pubRoles) return []
        const display = []

        for (const code of pubRoles) {
            const role = pubStore.roles.find(r => r.code == code)
            if (role) display.push(role.display)
        }

        return display
    })

    async function upsert(): Promise<void> {
        if (!publisher.value.id && !publisher.value.name) return
        const mode = await pubStore.upsert(publisher.value)
        if (mode != 'insert') return

        publisher.value = {
            name: '',
            roles: ['demo'],
        }
    }

</script>

<style scoped>
    .row
    {
        height: 2.3em;
        font-size: .9em;
        padding: 2.5px;
        border-bottom: 1px solid rgb(221, 221, 221);
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
        display: flex;
        gap: 4px;
        align-items: center
    }

    .role
    {

        padding: 3px 10px;
        font-size: .80em;
        border: none;
        border-radius: 14px;
        background: rgb(238, 238, 238);
        color: rgb(107, 107, 107);
        cursor: pointer;
        user-select: none;
    }

</style>