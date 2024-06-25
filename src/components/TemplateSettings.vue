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
                    <div class="action-item" @click="BackUp">
                        Create Backup
                        <span>
                            <IconArrow />
                        </span>
                    </div>
                    <div class="action-item">
                        <label for="fileInput" class="file-label">
                            Restore Backup
                            <input type="file" id="fileInput" accept=".txt" @change="Restore" />
                            <span>
                                <IconArrow />
                            </span>
                        </label>
                    </div>
                    <div class="action-item" @click="hardReset">
                        Reset Data
                        <span>
                            <IconArrow />
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <div>
            <div class="form-subtitle">Support & Questions</div>
            <div class="frm-inpts">
                <div>
                    Do you need assistance or have any questions? Are there any features you would like to request?
                </div>
                <a href="https://m.me/312885485248553" target="_blank">
                    <lord-icon src="https://cdn.lordicon.com/ayhtotha.json" trigger="hover" colors="primary:#ffffff">
                    </lord-icon>
                    Chat Developer
                </a>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
    import { useCongregationStore } from '@/stores/congregation';
    import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
    import { useFilesStore } from '@/stores/files';
    import { useEventStore } from '@/stores/events';
    import { useVisitStore } from '@/stores/visits';
    import { meetingTimes } from '@/assets/utils/times';
    import { BackUp, HARD_STORAGE_RESET, Restore } from '@/assets/utils/backup';
    import type { EventDetail } from '@/types/event';
    import type { VisitDetail } from '@/types/visit';
    import FormInput from './reusables/FormInput.vue';
    import FormSelect from './reusables/FormSelect.vue';
    import FormSwitch from './reusables/FormSwitch.vue';
    import IconArrow from './icons/IconArrow.vue';

    const emits = defineEmits(['hideMe']);
    const congStore = useCongregationStore()
    const fileStore = useFilesStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()

    const timeOptions = ref<{ id: string; name: string; }[]>([])
    const hasVisit = ref(false)
    const hasEvent = ref(false)
    const congformModal = ref(null);

    const isS140 = computed(() => {
        return congStore.congregation.mwbTemplate === 's-140'
    })

    const visitDetail = ref<VisitDetail>({
        weekId: null, talk: null, sjj: null, co: null,
    })

    const eventDetail = ref<EventDetail>({
        code: null, weekId: null, theme: null,
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
        await HARD_STORAGE_RESET()
    }

    watch(
        () => hasVisit.value,
        () => visitStore.setVisit(visitDetail.value, hasVisit.value)
    )

    watch(
        () => hasEvent.value,
        () => eventStore.setEvent(eventDetail.value, hasEvent.value)
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
        flex-direction: column;
        gap: 10px;
    }

    .action-item
    {
        padding: 10px 20px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        border: 1px rgba(250, 250, 250, 0.582) solid;
        border-radius: 4px;
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