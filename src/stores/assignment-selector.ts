import type { PartItem, S140PartItem } from "@/types/files";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAssignmentSelector = defineStore('assignment-selectr', () => {
    const targetRect = ref<DOMRect>()
    const part = ref<S140PartItem | PartItem>()
    const show = ref(false)

    const setTargetRect = (rect: DOMRect, targetPart: S140PartItem | PartItem) => {
        targetRect.value = rect;
        part.value = targetPart;
        show.value = true
    }

    return {
        part,
        show,
        setTargetRect,
    }
})