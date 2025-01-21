<template>
    <div class="badge" v-if="notification.unread > 0">
        <div class="round">
            {{ notification.unread }}
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useNotificationsStore } from '@/stores/notifications';

    const notification = useNotificationsStore()



</script>

<style scoped>
    .badge
    {
        position: absolute;
        top: 0;
        right: 0;
    }

    .round
    {
        display: flex;
        align-items: center;
        justify-items: center;
        background-color: rgb(255, 0, 34);
        padding: 1px 5px;
        border-radius: 10px;
        font-size: .80em;
    }
</style>