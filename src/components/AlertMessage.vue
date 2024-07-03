<template>
    <PopAlert>
        <div class="header">
            {{ settings.header }}
        </div>
        <div class="msg">
            {{ settings.msg }}
        </div>
        <div class="footer">
            <button class="btn-confirm" @click.stop="close" v-if="settings.confirm">{{ settings.confirmText }}</button>
            <button class="btn-cancel" @click.stop="close" v-if="settings.cancel">{{ settings.cancelText }}</button>
        </div>
    </PopAlert>
</template>

<script setup lang="ts">
    import { useViewStore } from '@/stores/views';
    import PopAlert from '@/components/layouts/PopAlert.vue'
    import type { AlertIcons, AlertSettings } from '@/types/vforms';

    const viewStore = useViewStore()

    interface Props {
        settings: AlertSettings,
    }

    const props = withDefaults(
        defineProps<Props>(),
        {
            settings: {
                confirm: true,
                confirmText: 'OK',
                header: 'Header',
                icon: 'none' as AlertIcons,
                msg: 'Message',
                cancel: true,
                cancelText: 'Cancel',
            }
        }
    )

    function close() {
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

    .msg
    {
        font-size: 1.15em;
        font-weight: 400;
        color: rgb(20, 20, 20);
        padding: 20px 10px 10px 10px;
    }

    .footer
    {
        display: flex;
        padding: 0px 10px 0px;
        justify-content: end;
        align-items: baseline;
    }

    .btn-confirm,
    .btn-cancel
    {
        padding: 8px 35px;
        cursor: pointer;
        border: none;
        color: white;
        border-radius: 3px;
    }

    .btn-cancel
    {}

    .btn-confirm
    {
        background: #3DA8EA;
    }
</style>