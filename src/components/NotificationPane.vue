<template>
    <div class="notification-pane">
        <div class="list">
            <div v-for="item in notificationStore.final" :key="item.id"
                :class="['item', { 'clickable': item.link }, { 'unread': isUnread(item) }]">
                <div class="noti-subheader">
                    <div>
                        {{ item.subheader }}
                    </div>
                    <div> &bullet;</div>
                    <div class="noti-date">
                        {{ ts(item.date) }}
                    </div>
                </div>
                <div class="noti-title" @click="gotoLink(item.link)">
                    {{ item.title }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { useNotificationsStore } from '@/stores/notifications';
    import type { Notification } from '@/types/notification';
    import { useTimeAgo } from '@vueuse/core';

    const notificationStore = useNotificationsStore()

    const gotoLink = (link: string | undefined) => {
        if (!link) return
        window.location.href = link
    }

    const ts = (date: string) => {
        return useTimeAgo(new Date(date)).value
    }

    const isUnread = (item: Notification) => {
        return item?.isUnread ?? false
    }

</script>

<style scoped>
    .notification-pane
    {
        position: absolute;
        right: 0;
        margin-top: 10px;
        background: white;
        color: black;
        padding: 25px 2px 5px;
        border-radius: 3px;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }

    .list
    {
        display: flex;
        flex-flow: column;
        gap: 5px;
        max-width: 500px;
        min-width: 400px;
        max-height: 300px;
        overflow-y: auto;
    }

    .unread
    {
        font-weight: 600;
    }

    .item
    {
        padding: 10px 15px;
    }

    .clickable
    {
        cursor: pointer;
    }

    .item:hover
    {
        background: rgba(128, 128, 128, 0.205);
    }

    .noti-title
    {
        font-weight: 400;
        font-size: 1em;
    }

    .noti-subheader
    {
        display: flex;
        gap: 5px;
        align-items: center;
        font-size: 1em;
    }

    .noti-date
    {
        font-size: .99em;
        text-transform: capitalize;
        font-style: italic;
    }
</style>