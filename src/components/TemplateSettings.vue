<template>
    <div class="cong-form-modal" ref="congformModal">
        <div class="frm-inpts">
            <div class="form-subtitle">Congregation Details</div>
            <FormInput v-model="congStore.congregation.name" :placeholder="'Congregation/Group Name'"
                :label="'Congregation/Group'">
            </FormInput>
            <FormSelect v-model="congStore.congregation.lang" :items="congStore.supportedLanguages" :id="'code'"
                :display="'lang'" :label="'Meeting Language'">
            </FormSelect>
            <FormSelect v-model="congStore.congregation.classId" :items="congStore.supportedClasses"
                :display="'display'" :label="'Ministry Classes'">
            </FormSelect>
        </div>

        <div class="frm-inpts">
            <div class="form-subtitle">Preferences</div>
            <FormSelect v-model="congStore.congregation.mwbTemplate" :items="fileStore.templates" :id="'code'"
                :label="'Schedule Template'">
            </FormSelect>
            <FormSelect v-model="congStore.congregation.midweekDay" :items="congStore.mwbMeetingDays" :display="'label'"
                :label="'Midweek Day'">
            </FormSelect>
            <FormSelect v-show="isS140" v-model="congStore.congregation.midweekTime" :items="timeOptions"
                :label="'Midweek Start Time'">
            </FormSelect>
        </div>

        <div>
            <div class="form-subtitle">Circuit Overseer's Visit</div>
            <div class="switch">
                <FormSwitch v-model="hasVisit" label="Has circuit overseer's visit this month"></FormSwitch>
            </div>
            <div v-if="hasVisit" class="frm-inpts">
                <FormSelect v-model="visitDetail.weekId" :items="fileStore.weekOptions" :label="'Visit Week'"
                    :placeholder="'Select Visit Week'"></FormSelect>
                <FormInput v-model="visitDetail.co" :placeholder="'Circuit Overseer'" :label="'Circuit Overseer'">
                </FormInput>
                <FormInput v-model="visitDetail.talk" :placeholder="'1st Service Talk Theme'" :label="'Service Talk'">
                </FormInput>
                <FormInput v-model="visitDetail.sjj" :numeric="true" :placeholder="'Song number to be used'"
                    :label="'Song Number'">
                </FormInput>
            </div>
        </div>
        <div>
            <div class="form-subtitle">Conventions/Assemblies</div>
            <div class="switch">
                <FormSwitch v-model="hasEvent" label="Has convention or assembly this month"></FormSwitch>
            </div>
            <div v-if="hasEvent" class="frm-inpts">
                <FormSelect v-model="eventDetail.weekId" :items="fileStore.weekOptions" :label="'Event Week'"
                    :placeholder="'Select Event Week'"></FormSelect>
                <FormSelect v-model="eventDetail.code" :items="eventStore.options" :label="'Event'"
                    :placeholder="'Select Event'" :id="'code'">
                </FormSelect>
                <FormInput v-model="eventDetail.theme" :placeholder="'Event theme'" :label="'Theme'">
                </FormInput>

            </div>
        </div>
        <div>
            <div class="form-subtitle">Back-up & Restore</div>
            <div>
                <div class="actions">

                    <div class="action-item" @click="backup">
                        Create Backup
                    </div>

                    <div class="action-item">
                        <label for="fileInput" class="file-label">
                            Restore Backup
                            <input type="file" id="fileInput" accept=".txt" @change="restore" />
                        </label>
                    </div>

                    <div class="action-item" @click="hardReset">
                        Reset Data
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div class="form-subtitle">Support & Questions</div>
            <div class="frm-inpts">
                <div>
                    Do you need assistance or have any questions? Are there any features you would like to suggest to
                    improve the program?
                </div>
                <a href="https://m.me/312885485248553" target="_blank">
                    <lord-icon src="https://cdn.lordicon.com/ayhtotha.json" trigger="hover" colors="primary:#ffffff">
                    </lord-icon>
                    Chat for Support
                </a>
            </div>
        </div>

    </div>
    <AlertMessage :confirm="alerts.confirm" :confirm-text="alerts.confirmText" :header="alerts.header"
        :icon="alerts.icon" :msg="alerts.msg" :cancel="alerts.cancel" :cancel-text="alerts.cancelText"
        @confirm="execConfirm" />
</template>

<script setup lang="ts">
    import { useCongregationStore } from '@/stores/congregation';
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
    import { useFilesStore } from '@/stores/files';
    import { useEventStore } from '@/stores/events';
    import { useVisitStore } from '@/stores/visits';
    import { useViewStore } from '@/stores/views';
    import { meetingTimes } from '@/assets/utils/times';
    import { BackUp, HARD_STORAGE_RESET, Restore } from '@/assets/utils/backup';
    import { useToast } from 'vue-toast-notification';
    import type { EventDetail } from '@/types/event';
    import type { VisitDetail } from '@/types/visit';
    import type { AlertIcons, AlertSettings } from '@/types/vforms';
    import FormInput from './reusables/FormInput.vue';
    import FormSelect from './reusables/FormSelect.vue';
    import FormSwitch from './reusables/FormSwitch.vue';
    import AlertMessage from './AlertMessage.vue';

    type ConfirmActions = 'none' | 'reset'
    const $toast = useToast();
    const alerts = ref<AlertSettings>({
        confirm: true,
        confirmText: 'OK',
        icon: 'none' as AlertIcons,
    })

    const alertAction = ref<ConfirmActions>('none')

    const emits = defineEmits(['hideMe']);
    const congStore = useCongregationStore()
    const fileStore = useFilesStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()
    const viewStore = useViewStore()

    const timeOptions = ref<{ id: string; name: string; }[]>([])
    const hasVisit = ref(false)
    const hasEvent = ref(false)
    const congformModal = ref(null);

    const isS140 = computed(() => {
        return congStore.congregation.mwbTemplate === 's-140'
    })

    const visitDetail = ref<VisitDetail>({
        weekId: undefined, talk: undefined, sjj: undefined, co: undefined,
    })

    const eventDetail = ref<EventDetail>({
        code: undefined, weekId: undefined, theme: undefined,
    })

    function hideCongSettings() {
        emits('hideMe')
    }

    function handleOutsideCongform(event: Event) {
        const input = congformModal.value as HTMLElement | null
        if (!input) return
        if (input && !input.contains(event.target as Node)) {
            hideCongSettings();
            if (!fileStore.loadedMonth) return
            const period = fileStore.currentPeriod
            fileStore.loadMonthTemplate(period);
        }
    };

    async function loadVisit() {
        hasVisit.value = visitStore.hasMonthVisit
        if (!hasVisit.value) return
        if (!visitStore.loadDetail) return
        visitDetail.value = visitStore.loadDetail
    }

    async function loadEvent() {
        hasEvent.value = eventStore.hasMonthEvent
        if (!hasEvent.value) return
        if (!eventStore.loadDetail) return
        eventDetail.value = eventStore.loadDetail
    }

    async function hardReset(): Promise<void> {
        resetConfirmation()
    }

    async function warnAlert(msg: string, header: string = '', cancel: boolean = false, confirmText: string = '', cancelText: string = '') {
        alerts.value.msg = msg
        alerts.value.header = header
        alerts.value.cancel = cancel
        alerts.value.cancelText = cancelText || "Cancel"
        alerts.value.confirmText = confirmText || 'OK'
        viewStore.setPopAlert(true)
    }

    async function resetConfirmation() {
        alertAction.value = 'reset'
        warnAlert(
            "All of your data will be wiped-out from your browser's storage. Are you sure to reset anyway?",
            'Reseting App',
            true, "RESET", "DON'T RESET"
        )
    }

    async function backup() {
        await BackUp()
        $toast.success('Backup Created!', { position: 'top-right' })
    }

    async function restore($evt: Event) {
        await Restore($evt)
        $toast.success('Backup Restored!', { position: 'top-right' })
    }

    async function execConfirm() {
        if (alertAction.value === 'reset') {
            HARD_STORAGE_RESET()
        } else if (alertAction.value === 'none') {
            //  Do nothing
        }
    }

    watch(
        () => hasVisit.value,
        () => visitStore.setVisit(visitDetail.value, hasVisit.value)
    )

    watch(
        () => hasEvent.value,
        () => eventStore.setEvent(eventDetail.value, hasEvent.value)
    )

    watch(
        () => [
            congStore.congregation.mwbTemplate,
            congStore.congregation.classId
        ],
        () => {
            if ((congStore.congregation.classId > 1) && congStore.congregation.mwbTemplate === 'a-100') {
                alertAction.value = 'none'
                const header = 'Auxiliary Class'
                const msg = 'Sorry! Customized template is not fully supported on scheduling midweek meetings with auxiliary classes.'
                warnAlert(msg, header, false)
            }
        }
    )

    onMounted(async () => {
        timeOptions.value = await meetingTimes()
        await loadVisit();
        await loadEvent();
        document.addEventListener('click', handleOutsideCongform);
    })

    onUnmounted(() => {
        document.removeEventListener('click', handleOutsideCongform);
    })
</script>

<style scoped>
    .cong-form-modal
    {

        position: absolute;
        width: 480px;
        top: calc(100% + 20px);
        right: calc(100% - 30px);
        min-height: 400px;
        max-height: 80vh;
        height: max-content;
        overflow: auto;
        padding: 40px;
        background: white;
        display: flex;
        flex-direction: column;
        border-radius: 5px;
        box-shadow: rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px;
        color: grey;
    }

    .frm-inpts
    {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding-bottom: 25px;
    }

    .switch
    {
        padding: 10px 0;
    }

    a
    {
        background: #1872aa;
        color: white;
        padding: 8px 20px 8px 18px;
        cursor: pointer;
        transition: ease-in .1s;
        text-decoration: none;
        font-size: small;

        display: inline-flex;
        align-items: center;
        gap: 10px;
        border-radius: 10px;
        max-width: fit-content;
    }

    a:hover
    {
        background: #126599;
    }

    .actions
    {
        padding: 10px 0;
        display: flex;
        justify-content: space-between;
        gap: 8px;
    }

    .action-item
    {
        padding: 10px 10px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        flex: 1;
        border-radius: 4px;
        border: 1px rgb(218, 218, 218) solid;
    }

    .file-label
    {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        cursor: pointer;
    }

    .file-label input[type="file"]
    {
        display: none;
    }

    .action-item:hover
    {
        color: black;
        border: 1px rgb(218, 218, 218) solid;
        background: rgba(250, 250, 250, 0.301);
    }

    svg
    {
        height: 20px;
        width: 20px;
        opacity: .3;
    }
</style>

<style>
    .form-subtitle
    {
        font-size: small;
        text-transform: uppercase;
        color: #3DA8EA;
        font-weight: 500;

    }
</style>