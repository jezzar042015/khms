import type { S140PartItem } from "@/types/files";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAssignmentSelector = defineStore('assignment-selectr', () => {
    const targetRect = ref<DOMRect>()
    const part = ref<S140PartItem>()

    const setTargetRect = (rect: DOMRect, targetPart: S140PartItem) => {
        targetRect.value = rect;
        part.value = targetPart;
        console.log(rect);
        console.log(targetPart);
    }

    return {
        setTargetRect
    }
})