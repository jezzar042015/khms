<template>
    <div class="slip-wrapper" ref="slip">
        <div class="actions">
            <div class="action-item" @click="download" v-show="shooter" style="padding-top: 4px;">
                <IconDownload />
            </div>
            <div class="action-item" @click="capture" v-show="shooter">
                <IconCamera />
            </div>
        </div>
        <div class="wrapper">
            <div class="slip-title bold">
                OUR CHRISTIAN LIFE AND MINISTRY MEETING ASSIGNMENT
            </div>
            <div class="student">
                <div class="infoline">
                    <span class="bold">Name: </span>
                    <span class="line">
                        <span class="field bold"> {{ studentName }}</span>
                    </span>
                </div>
                <div class="infoline">
                    <span class="bold">Assistant: </span>
                    <span class="line">
                        <span class="field bold"> {{ assistant }}</span>
                    </span>
                </div>
                <div class="infoline">
                    <span class="bold">Date: </span>
                    <span class="line">
                        <span class="field bold"> {{ assignDate }}</span>
                    </span>
                </div>
                <div class="infoline">
                    <span class="bold">Part no.: </span>
                    <span class="line">
                        <span class="field bold">{{ partNum }}</span>
                    </span>
                </div>
            </div>
            <div>
                <div class="bold classesheader">To be given in: </div>
                <div class="classes">
                    <div class="room">
                        <span :class="boxMain">
                            <IconCheck />
                        </span>
                        <span>Main Hall</span>
                    </div>
                    <div class="room">
                        <span :class="boxAux1">
                            <IconCheck />
                        </span>
                        <span>Auxiliary classroom 1</span>
                    </div>
                    <div class="room">
                        <span :class="boxAux2">
                            <IconCheck />
                        </span>
                        <span>Auxiliary classroom 2</span>
                    </div>
                </div>
            </div>
            <div class="subnote">
                <strong class="bold">Note to student: </strong> The source material and study
                point for your assignment can be found in the <i>Life
                    and Ministry Meeting Workbook</i>. Please review the
                instructions for the part as outlined in <i>Instructions for
                    Our Christian Life and Ministry Meeting</i> (S-38).
            </div>
            <div class="version">
                S-89-E 11/23
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed, ref } from 'vue';
    import { useAssignmentStore } from '@/stores/assignment';
    import { usePublisherStore } from '@/stores/publisher';
    import { useFilesStore } from '@/stores/files';
    import { useToast } from 'vue-toast-notification';
    import type { PartItem } from '@/types/files';
    import domtoimage from 'dom-to-image';
    import IconCheck from './icons/IconCheck.vue';
    import IconCamera from './icons/IconCamera.vue';
    import IconDownload from './icons/IconDownload.vue';

    const $toast = useToast();
    const props = defineProps<{
        part: PartItem
    }>()

    type Classrooms = 'main' | 'aux1' | 'aux2'


    const assignStore = useAssignmentStore()
    const pubStore = usePublisherStore()
    const fileStore = useFilesStore()
    const slip = ref<HTMLElement>()
    const shooter = ref(true)

    const isDemo = computed(() => props.part.roles?.includes('demo'))
    const isBibleReading = computed(() => props.part.roles?.includes('br'))
    const isTalk = computed(() => props.part.roles?.includes('talk'))

    const studentName = computed(() => {
        const part = assignStore.get.find(p => p.pid == props.part.id)
        if (!part) return null

        const areStudents = (isDemo.value || isBibleReading.value || isTalk)
        const pubid = (areStudents) ? part.a[0] : part.a
        const pub = pubStore.publishers.find(p => p.id == pubid)
        return pub?.name
    })

    const assistant = computed(() => {
        const part = assignStore.get.find(p => p.pid == props.part.id)
        if (!part) return null

        const areStudents = (isDemo.value || isBibleReading.value || isTalk)
        const pubid = (areStudents) ? part.a[1] : part.a
        const pub = pubStore.publishers.find(p => p.id == pubid)
        return pub?.name
    })

    const classAssignment = computed<Classrooms>(() => {
        if (props.part.id.includes('.ax1')) return 'aux1'
        return 'main'
    })

    const assignDate = computed(() => {
        const weeks = fileStore.weekOptions
        const weekId = props.part.id.substring(0, 8);
        const week = weeks.find(w => w.id == weekId)
        return week?.name
    })

    const partNum = computed(() => {
        const title = props.part.title ?? ''
        const perPos = title.indexOf('.')
        const partNum = title.substring(0, perPos)
        return /^-?\d+(\.\d+)?$/.test(partNum) ? `#${title.substring(0, perPos)}` : title;
    })
    const boxMain = computed(() => {
        return ['checkbox', { 'checked': classAssignment.value == 'main' }]
    })

    const boxAux1 = computed(() => {
        return ['checkbox', { 'checked': classAssignment.value == 'aux1' }]
    })

    const boxAux2 = computed(() => {
        return ['checkbox', { 'checked': classAssignment.value == 'aux2' }]
    })

    async function capture() {

        if (!slip.value) return;
        const element = slip.value;

        try {
            shooter.value = false
            const dataUrl = await domtoimage.toPng(element);
            const blob = await (await fetch(dataUrl)).blob();
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            shooter.value = true
            $toast.info('Assignment slip is copied in your clipboard!', { position: 'top', duration: 5000 })
        } catch (error) {
            console.error('Failed to capture image and copy to clipboard:', error);
        }
    }

    async function download() {
        if (!slip.value) return;
        const element = slip.value;
        try {
            shooter.value = false
            const dataUrl = await domtoimage.toPng(element);
            const blob = await (await fetch(dataUrl)).blob();
            const options = {
                types: [
                    {
                        description: 'PNG file',
                        accept: {
                            'image/png': ['.png'],
                        },
                    },
                ],
            };

            const handle: FileSystemFileHandle = await (window as any).showSaveFilePicker(options);
            const writableStream = await handle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
            shooter.value = true
            $toast.info('Assignment slip was successfully downloaded!', { position: 'top', duration: 5000 })
        } catch (error) {
            $toast.warning('Assignment slip was not downloaded!', { position: 'top', duration: 5000 })
            shooter.value = true
        }
    }
</script>

<style scoped>
    .slip-wrapper
    {
        background-color: white;
        border: 1px solid rgba(128, 128, 128, 0.205);
        font-size: 16px;
        padding: 25px;
        width: 100%;
        height: 100%;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 2px 0px;
        transition: box-shadow .2s;
        position: relative;
    }

    .actions
    {
        display: flex;
        position: absolute;
        bottom: 10px;
        right: 10px;
        z-index: 1;
        gap: 10px;
        align-items: center;
    }

    .action-item
    {
        cursor: pointer;
        opacity: 0;
        transition: opacity .5s;
        display: flex;
        align-items: center;
        align-content: center;
    }

    .action-item svg
    {
        align-self: center;
        height: 34px;
        width: 34px;
        opacity: .4;
        transition: opacity .2s;
    }

    .action-item svg:hover
    {
        opacity: 1;
    }

    .slip-wrapper:hover .action-item
    {
        opacity: .4;
    }

    .slip-wrapper:hover
    {
        box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
        scale: 1.01;
        z-index: 2;
        background-color: white;
    }

    .wrapper
    {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background-color: white;
    }

    .slip-title
    {
        font-size: 1.2em;
        text-align: center
    }

    .checkbox
    {
        display: inline-flex;
        height: 13.5px;
        width: 13.5px;
        border: 1px solid black;
        position: relative;
    }

    .checkbox:not(.checked) svg
    {
        display: none;
    }

    .checked svg
    {
        position: absolute;
        height: 30px;
        left: -10px;
        top: -10px;
        fill: #070750;
    }

    .classesheader
    {
        margin-bottom: 8px;
    }

    .classes,
    .student
    {
        display: flex;
        flex-direction: column;
    }

    .classes
    {
        gap: 5px;
    }

    .student
    {
        gap: 10px
    }

    .infoline
    {
        display: flex;
        gap: 4px;
        width: 100%;
        align-items: flex-end;
    }

    .infoline span:first-child
    {
        display: flex;
        align-items: flex-end;
    }

    .line
    {
        flex: 1;
        height: 100%;
        display: flex;
        justify-content: flex-end;
        border-bottom: 2px rgba(0, 0, 0, 0.562) dotted;
    }

    .field
    {
        min-width: 250px;
        display: inline;
        color: #070777c4;
    }

    .room
    {
        align-items: center;
        display: flex;
        gap: 15px;
        padding-left: 25px;
    }

    .bold
    {
        font-weight: 600;
    }

    .subnote
    {
        text-align: justify;
        font-size: .92em;
    }

    .version
    {
        font-size: .89em;
        font-weight: 400;
    }

    @media print
    {

        .slip-wrapper
        {
            box-shadow: none;
        }

        .actions
        {
            display: none;
        }
    }

</style>