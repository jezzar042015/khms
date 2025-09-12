<template>
    <PopAlert>
        <div class="header">
            {{ header }}
        </div>
        <div class="msg">
            {{ msg }}
        </div>
        <div class="footer">
            <button class="btn-confirm" @click.stop="confirmed" v-if="confirm">
                {{ confirmText }}
            </button>
            <button class="btn-cancel" @click.stop="close" v-if="cancel">
                {{ cancelText }}
            </button>
        </div>
    </PopAlert>
</template>

<script setup lang="ts">
    import { useViewStore } from '@/stores/views';
    import type { AlertIcons, AlertSettings } from '@/types/vforms';
    import PopAlert from '@/components/layouts/PopAlert.vue'

    const viewStore = useViewStore()

    const emits = defineEmits(['confirm', 'cancel'])

    const {
        confirm = true,
        confirmText = 'OK',
        header = 'Header',
        icon = 'none' as AlertIcons,
        msg = 'Message',
        cancel = true,
        cancelText = 'Cancel',
    } = defineProps<{
        confirm?: boolean;
        confirmText?: string;
        header?: string;
        icon?: AlertIcons;
        msg?: string;
        cancel?: boolean;
        cancelText?: string;
    }>()

    function close() {
        emits('cancel')
        viewStore.setPopAlert(false)
    }

    function confirmed() {
        emits('confirm')
        viewStore.setPopAlert(false)
    }
</script>

<style scoped>

    .header
    {
        text-wrap: nowrap;
        color: rgb(48, 48, 48);
        padding: 0px 10px 0px 10px;
    }

    .header:empty
    {
        padding: 0px;
        display: none;
    }

    .msg
    {
        font-size: 1.1em;
        font-weight: 400;
        color: rgb(20, 20, 20);
        padding: 10px;
    }

    .footer
    {
        display: flex;
        padding: 0px 10px 0px;
        justify-content: end;
        align-items: baseline;
        gap: 10px
    }

    .btn-confirm,
    .btn-cancel
    {
        padding: 8px 30px;
        cursor: pointer;
        border: none;
        border-radius: 3px;
        font-size: .8em;
    }

    .btn-cancel
    {
        color: gray;
    }

    .btn-confirm
    {
        color: white;
        background: #3DA8EA;
    }
</style>