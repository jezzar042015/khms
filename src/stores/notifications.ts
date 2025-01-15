import notifications from "@/data/notifications";
import type { Notification } from "@/types/notification";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useNotificationsStore = defineStore('notification', () => {
    const items = ref<Notification[]>(notifications)
    const unread = ref(1)

    const final = computed(() => {
        return items.value
            .map(a => ({
                unread: true,
                ...a
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    });

    return {
        unread,
        items,
        final
    }
})