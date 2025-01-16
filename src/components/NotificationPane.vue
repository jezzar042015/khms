<template>
    <div class="notification-pane" ref="pane" v-if="notificationStore.displayPane">
        <div class="noti-header">
            What's New
        </div>
        <div class="list">
            <div v-for="item in notificationStore.final" :key="item.id"
                :class="['item', { 'clickable': item.link }, { 'unread': isUnread(item) }]">
                <div class="icon">
                    <IconHelp v-if="item.icon == 'help'" />
                    <IconBell v-if="item.icon == 'new'" />
                </div>
                <div>
                    <div class="noti-subheader" @mouseover="readMe(item.id)">
                        <div>
                            {{ item.subheader }}
                        </div>
                        <div> &bullet;</div>
                        <div class="noti-date">
                            {{ ts(item.date) }}
                        </div>
                    </div>
                    <div :class="['noti-title', { 'is-link': item.link }]" @click="gotoLink(item.link)">
                        {{ item.title }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref } from 'vue';
    import { useNotificationsStore } from '@/stores/notifications';
    import type { Notification } from '@/types/notification';
    import { useTimeAgo, onClickOutside } from '@vueuse/core';
    import { useRouterStore } from '@/stores/router';
    import IconHelp from './icons/IconHelp.vue';
    import IconBell from './icons/IconBell.vue';

    const notificationStore = useNotificationsStore()
    const routerStore = useRouterStore()
    const pane = ref(null)

    const gotoLink = (link: string | undefined) => {
        if (!link) return

        if (link.startsWith('?')) {
            routerStore.addSearchParams(link)
            return
        }
        window.location.href = link
    }

    const ts = (date: string) => {
        return useTimeAgo(new Date(date)).value
    }

    const isUnread = (item: Notification) => {
        return item?.unread
    }

    const readMe = (id: string) => {
        notificationStore.newReadAlerts([id])
    }

    onClickOutside(pane, event => notificationStore.displayPane = false)

    onMounted(() => {
        notificationStore.clearStorage()
    })
</script>

<style scoped>
    .notification-pane
    {
        position: absolute;
        right: 0;
        margin-top: 10px;
        background: white;
        color: black;
        padding: 20px 2px 5px;
        border-radius: 3px;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }

    .noti-header
    {
        padding: 0px 15px 5px;
        font-size: 1.5em;
        font-weight: 600;
    }

    .list
    {
        display: flex;
        flex-flow: column;
        gap: 1px;
        max-width: 500px;
        min-width: 400px;
        max-height: 300px;
        overflow-y: auto;
    }

    .unread,
    .unread>.noti-title
    {
        font-weight: 600;
    }

    .item
    {
        padding: 5px 15px;
        display: flex;
        gap: 10px;
    }

    .icon
    {
        background: rgba(128, 128, 128, 0.61);
        padding: 0px 4px;
        border-radius: 5px;
        height: 40px;
    }

    .icon svg
    {
        height: 30px;
        width: 30px;

    }

    .clickable
    {
        cursor: pointer;
    }

    .item:hover
    {
        background: rgba(128, 128, 128, 0.226);
    }

    .is-link:hover
    {
        text-decoration: underline;
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
        font-size: .9em;
    }

    .noti-date
    {
        text-transform: capitalize;
        font-style: italic;
    }
</style>