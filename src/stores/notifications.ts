import notifications from "@/data/notifications";
import type { Notification } from "@/types/notification";
import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useNotificationsStore = defineStore('notification', () => {
    const items = ref<Notification[]>(notifications)
    const displayPane = ref(false)

    const final = computed(() => {
        return items.value
            .map(a => ({
                unread: !readAlerts.value.includes(a.id),
                ...a
            }))
            .sort((a, b) => b.date.localeCompare(a.date));
    });

    const readAlerts = useStorage<string[]>('khms-read-alerts', []);

    const newReadAlerts = (list: string[]) => {
        for (const id of list) {
            const exist = readAlerts.value.includes(id)
            if (!exist) {
                readAlerts.value.push(id)
            }
        }
    }

    const unread = computed(() => {
        return final.value.reduce((a, c) => a + (c.unread ? 1 : 0), 0);
    });

    const unreadIds = computed(() => {
        return final.value.filter(a => a.unread).map(a => a.id)
    })

    const clearStorage = () => {
        const itemIds = items.value.map(a => a.id)
        for (const id of readAlerts.value) {
            const exist = itemIds.includes(id)
            if (!exist) {
                readAlerts.value = readAlerts.value.filter(a => a !== id)
            }
        }
    }

    return {
        displayPane,
        unread,
        unreadIds,
        items,
        final,
        readAlerts,
        newReadAlerts,
        clearStorage
    }
})