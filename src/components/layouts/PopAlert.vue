<template>
    <teleport to='body'>
        <div class="modal-bg" v-if="viewStore.popUpAlert" @click.prevent.stop>
            <div class="modal">
                <slot></slot>
            </div>
        </div>
    </teleport>
</template>

<script setup lang="ts">
    import { useViewStore } from '@/stores/views';

    const viewStore = useViewStore()
</script>

<style scoped>
    .modal-bg
    {
        height: 100%;
        width: 100%;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.61);
        position: absolute;
        top: 0;
        left: 0;
        z-index: 3;
        display: grid;
        place-items: center;
    }

    .modal
    {
        background: white;
        border-radius: 4px;
        box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        max-width: 25%;
        gap: 10px;
    }
</style>