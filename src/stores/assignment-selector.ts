import type { PartItem, S140PartItem } from "@/types/files";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAssignmentSelector = defineStore('assignment-selectr', () => {
    const rect = ref<DOMRect>()
    const part = ref<S140PartItem | PartItem>()
    const show = ref(false)

    const setTargetRect = (targetRect: DOMRect, targetPart: S140PartItem | PartItem) => {
        rect.value = targetRect;
        part.value = targetPart;
        show.value = true
    }

    return {
        part,
        show,
        rect,
        setTargetRect,
    }
})