<template>
    <div class="role-selector" ref="roleSelector">
        <div>
            <div class="pubname">{{ pub.name }}</div>
            <div class="r-title">Assign Roles</div>
            <div class="list">
                <div class="role" v-for="role in availableRoles" :key="role.code" @click="addRole(role.code)">
                    <span class="icon">
                        <IconPlus />
                    </span>
                    <span>{{ role.display }}</span>
                </div>
                <div v-show="noAssignableRoles" class="msg">
                    All roles were already assigned to {{ pub.name }}!
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
    import { usePublisherStore } from '@/stores/publisher';
    import type { Publisher } from '@/types/publisher';
    import type { PubRole } from '@/types/pubrole';
    import IconPlus from '@/components/icons/IconPlus.vue'

    const pubStore = usePublisherStore()
    const emit = defineEmits(['hideMe', 'triggerOff'])

    const props = defineProps<{
        publisher: Publisher,
        triggered: boolean
    }>()

    const pub = ref<Publisher>({
        id: props.publisher.id,
        name: props.publisher.name,
        roles: props.publisher.roles,
    })

    const roleSelector = ref<HTMLElement>();

    const availableRoles = computed<PubRole[]>(() => {
        const loadable: PubRole[] = []
        const pubroles = pub.value.roles;

        for (const role of pubStore.roles) {
            if (!pubroles.includes(role.code))
                loadable.push(role)
        }
        return loadable
    })

    const noAssignableRoles = computed<boolean>(() => {
        return availableRoles.value.length === 0
    })

    async function addRole(role: string): Promise<void> {
        if (pub.value.roles.includes(role)) return
        pub.value.roles.push(role);
        await pubStore.upsert(pub.value);
    }

    function handleOutsideSelectorClick(event: Event): void {
        if (props.triggered) {
            emit("triggerOff");
            return;
        }

        if (roleSelector.value && !roleSelector.value.contains(event.target as HTMLElement)) {
            emit('hideMe')
        }
    };

    function adjustTransform() {
        if (roleSelector.value) {
            const rect = roleSelector.value.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            if (rect.top < viewportHeight / 3) {
                roleSelector.value.style.transform = 'translateY(0%)';
            } else if (rect.top < (viewportHeight * 2) / 3) {
                roleSelector.value.style.transform = 'translateY(-50%)';
            } else {
                roleSelector.value.style.transform = 'translateY(-90%)';
            }
        }
    }

    onMounted(() => {
        adjustTransform();
        document.addEventListener('click', handleOutsideSelectorClick);
        window.addEventListener('resize', adjustTransform);
    });

    onUnmounted(() => {
        document.removeEventListener('click', handleOutsideSelectorClick);
        window.removeEventListener('resize', adjustTransform);
    });

    watch(
        () => props.publisher,
        (newPublisher) => {
            pub.value.id = newPublisher.id;
            pub.value.name = newPublisher.name;
            pub.value.roles = newPublisher.roles;
        },
        { deep: true }
    )
</script>

<style scoped>
    .role-selector
    {
        display: flex;
        padding: 15px 15px;
        flex-direction: column;
        position: absolute;
        height: auto;
        width: auto;
        min-height: 50px;
        min-width: 180px;
        z-index: 1;
        top: 0;
        left: calc(100% + 10px);
        background: white;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
        color: rgb(54, 54, 54);
    }

    .pubname
    {
        padding: 2px 0 6px;
        font-size: 1.2em;
        text-wrap: nowrap;
        font-weight: 600;
    }

    .r-title
    {
        font-size: .9em;
        text-transform: uppercase;
        font-weight: 500;
    }

    .list
    {
        display: flex;
        gap: 5px;
        flex-direction: column;
        padding-top: 5px;
        width: 100%;
    }

    .role
    {
        display: flex;
        width: 100%;
        gap: 5px;
        align-items: center;
        padding: 4px 10px 4px 6px;
        background: #3da8ea18;
        border-radius: 20px;
        text-wrap: nowrap;
        transition: ease-in-out .1s;
        color: gray
    }

    .role:hover
    {
        background: #43a2ddc9;
        color: white;
    }

    .role:hover .icon svg
    {
        stroke: white;
        opacity: 1;
    }

    .icon
    {
        display: inline-flex;
    }

    .icon svg
    {
        height: 1.4em;
        opacity: .4;
        stroke: gray;
    }

    .msg
    {
        font-style: italic;
        font-size: 1.1em;
    }
</style>