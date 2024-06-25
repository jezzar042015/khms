import { useAssignmentStore } from "@/stores/assignment";
import { useCongregationStore } from "@/stores/congregation";
import { useEventStore } from "@/stores/events";
import { usePublisherStore } from "@/stores/publisher";
import { useVisitStore } from "@/stores/visits";
import type { Congregation } from "@/types/congregation";
import type { EventsDetails } from "@/types/event";
import type { Publisher } from "@/types/publisher";
import type { VisitsDetails } from "@/types/visit";

export async function HARD_STORAGE_RESET() {
    const congStore = useCongregationStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()
    const assignStore = useAssignmentStore()
    const pubStore = usePublisherStore()

    congStore.reset()
    pubStore.reset()
    eventStore.reset()
    visitStore.reset()
    assignStore.resetAll()
}

export async function BackUp() {
    const content = await compose()
    downloadAsText(content)
}

export async function Restore(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                if (e.target && typeof e.target.result === 'string') {
                    const backupText = e.target.result;
                    const json = JSON.parse(backupText);
                    restoreToLocals(json);
                } else {
                    console.error('Error: FileReader result is not a string.');
                }
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    }
}

async function compose(): Promise<Store> {
    const congStore = useCongregationStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()
    const assignStore = useAssignmentStore()
    const pubStore = usePublisherStore()

    return {
        cong: congStore.congregation,
        pubs: pubStore.publishers,
        assignments: await assignStore.fetchAllLocal(),
        events: eventStore.months,
        visits: visitStore.months,
        visitDetails: visitStore.details,
        eventDetails: eventStore.details,
    }
}

async function restoreToLocals(json: Store) {
    const congStore = useCongregationStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()
    const assignStore = useAssignmentStore()
    const pubStore = usePublisherStore()

    congStore.congregation = json.cong
    eventStore.months = json.events
    eventStore.details = json.eventDetails
    visitStore.months = json.visits
    visitStore.details = json.visitDetails
    pubStore.pubs = json.pubs
    assignStore.restore(json.assignments)

}

function downloadAsText(json: object) {
    const jsonString = JSON.stringify(json, null, 2);
    const blob = new Blob([jsonString], { type: 'text/plain' });
    const link = document.createElement('a');

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const fileName = `khms-backup-${year}-${month}-${day}-${hours}-${minutes}-${seconds}.txt`;

    link.download = fileName;
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

interface Store {
    cong: Congregation
    pubs: Publisher[]
    assignments: {
        key: string
        stored: any
    }[]
    events: string[]
    visits: string[]
    visitDetails: VisitsDetails
    eventDetails: EventsDetails
}