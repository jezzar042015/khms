<template>
    <div class="headbar no-print">
        <div class="set-wrappers">
            <div class="setters">
                <span>Month</span>
                <select v-model="fileStore.currentPeriod">
                    <template v-if="fileStore.langMonths">
                        <option :value="f.content.period" v-for="f in fileStore.langMonths" :key="f.content.period">
                            {{ f.content.display }}
                        </option>
                    </template>
                </select>
            </div>
            <div class="actions">
                <div id="printer">
                    <button @click="confirmPrinting">
                        <span class="icon">
                            <IconPrinter />
                        </span>
                        Print
                    </button>
                </div>

                <div id="students">
                    <button @click="toStudents">Publishers</button>
                </div>

                <div id="slips" v-if="!viewStore.assignmentSlips">
                    <button @click="toAssignmentSlips">Assignment Slips</button>
                </div>

                <div id="slips" v-if="!viewStore.mwbTemplate">
                    <button @click="toMwbTemplates">Schedules</button>
                </div>

                <div class="no-print" @click.stop="toHelp">
                    <IconHelp class="icon-base" />
                </div>

                <div class="cong-form no-print">

                    <lord-icon src="https://cdn.lordicon.com/lecprnjb.json" trigger="hover" colors="primary:#e6e6e6"
                        @click.stop="showCongSettings">
                    </lord-icon>

                    <template v-if="congSettingsDisplay">
                        <TemplateSettings @hide-me="hideCongSettings" />
                    </template>
                </div>
            </div>
        </div>
        <AlertMessage :cancel="alert.cancel" :cancel-text="alert.cancelText" :msg="alert.msg" :header="alert.header"
            @confirm="print" @cancel="viewPrintingTutorial" />
    </div>
    <slot></slot>
</template>

<script setup lang="ts">
    import { useFilesStore } from '@/stores/files';
    import { useViewStore } from '@/stores/views';
    import { ref } from 'vue';
    import type { AlertSettings } from '@/types/vforms';
    import IconPrinter from '../icons/IconPrinter.vue';
    import TemplateSettings from '../TemplateSettings.vue';
    import IconHelp from '../icons/IconHelp.vue';
    import AlertMessage from '../AlertMessage.vue';

    const fileStore = useFilesStore();
    const viewStore = useViewStore();
    const congSettingsDisplay = ref(false);
    const alert = ref<AlertSettings>({});

    function showCongSettings(): void {
        congSettingsDisplay.value = true
    }

    function hideCongSettings(): void {
        congSettingsDisplay.value = false
    }

    async function print(): Promise<void> {
        await viewStore.setPopAlert(false)
        window.print();
    }

    function confirmPrinting(): void {
        alert.value.msg = `To remove the "Headers and footers", uncheck the "Headers and footers" checkbox on the printing Settings.`
        alert.value.confirm = true
        alert.value.confirmText = "OK"
        alert.value.header = "Printing Tip"
        alert.value.cancel = true
        alert.value.cancelText = "See Tutorial"
        viewStore.setPopAlert(true)
    }

    function toStudents(): void {
        viewStore.setView('pubs')
    }

    function toAssignmentSlips(): void {
        viewStore.setView('slips')
    }

    function toMwbTemplates(): void {
        viewStore.setView('mwb')
    }

    function toHelp(): void {
        window.location.href = 'https://jezzar042015.github.io/khms-help/'
    }

    function viewPrintingTutorial(): void {
        window.open('https://jezzar042015.github.io/khms-help/?view=help&item=7', '_blank')
    }

</script>


<style scoped>
    .headbar
    {
        height: 60px;
        width: 100%;
        background: rgb(59, 56, 56);
        position: fixed;
        z-index: 3;
        box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
    }

    .set-wrappers
    {
        display: flex;
        margin: auto;
        height: 100%;
        max-width: 1070px;
        justify-content: space-between;
        align-items: center;
        color: white;
        font-weight: 300;
        font-size: 14px;
    }

    .actions
    {
        display: flex;
        gap: 10px;
        align-items: center
    }

    .setters
    {
        display: flex;
        gap: 0px;
        align-items: center;
        outline: none;
    }

    .setters span
    {
        color: rgb(192, 192, 192);
        width: 60px;
    }

    select
    {
        padding: 6px 15px;
        font-size: small;
        background: #e6e6e6;
        border-radius: 4px;
        border: none;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 20px;
        background-image: url("");
        background-repeat: no-repeat;
        background-position: right center;
        background-size: 5px;
    }

    #printer,
    #students,
    #slips
    {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
    }

    #printer button
    {
        border: 1px solid #3DA8EA;
        padding: 6px 20px;
        font-size: small;
        border-radius: 4px;
        background: #3DA8EA;
        color: white;
        cursor: pointer;
        transition: ease-in-out .2s;
        display: flex;
        gap: 10px
    }

    #printer button svg
    {
        height: auto;
    }

    #students button,
    #slips button
    {
        border: 1px solid #3DA8EA;
        padding: 7px 15px;
        font-size: small;
        border-radius: 4px;
        background: transparent;
        color: #3DA8EA;
        cursor: pointer;
        transition: ease-in-out .2s;
    }

    #printer button:hover
    {
        background: #3288bd;
    }

    #students button:hover,
    #slips button:hover
    {
        color: white;
        background: #3DA8EA;
    }

    .icon-base
    {
        cursor: pointer;
        opacity: .4;
        width: 28px;
        height: 28px;
        transition: ease-in-out .2s;
    }

    .icon-bell
    {
        cursor: pointer;
        opacity: .4;
        width: 32px;
        height: 32px;
        transition: ease-in-out .2s;
    }

    lord-icon
    {
        cursor: pointer;
        opacity: .4;
        width: 25px;
        height: 25px
    }

    lord-icon:hover,
    .icon-base:hover,
    .icon-bell:hover
    {
        opacity: .8;
    }

    .cong-form
    {
        position: relative;
    }

    hr
    {
        border: 0;
        height: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
</style>