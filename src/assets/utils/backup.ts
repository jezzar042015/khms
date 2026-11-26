import { useAssignmentStore } from "@/stores/assignment";
import { useCongregationStore } from "@/stores/congregation";
import { useEventStore } from "@/stores/events";
import { useFilesStore } from "@/stores/files";
import { useOverridesStore } from "@/stores/overrides";
import { usePartsOverride } from "@/stores/overrides-part";
import { useTimeOverrides } from "@/stores/overrides-time";
import { usePublisherStore } from "@/stores/publisher";
import { useViewStore } from "@/stores/views";
import { useVisitStore } from "@/stores/visits";
import type { Congregation } from "@/types/congregation";
import type { EventsDetails } from "@/types/event";
import type { PartItem } from "@/types/files";
import type { TimeOverride } from "@/types/override-time";
import type { Override } from "@/types/overrides";
import type { Publisher } from "@/types/publisher";
import type { VisitsDetails } from "@/types/visit";

export async function HARD_STORAGE_RESET() {
    const congStore = useCongregationStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()
    const assignStore = useAssignmentStore()
    const pubStore = usePublisherStore()
    const viewStore = useViewStore()
    const overrides = useOverridesStore()
    const overrideParts = usePartsOverride()
    const overrideTimes = useTimeOverrides()

    // Leave the schedule views first so nothing renders against half-cleared data
    viewStore.setView("welcome");
    await congStore.reset();
    await pubStore.reset();
    eventStore.reset();
    visitStore.reset();
    await assignStore.resetAll();
    overrides.stored = []
    overrideParts.stored = []
    overrideTimes.stored = []
}

export async function BackUp() {
    const content = await compose()
    downloadAsText(content)
}

/**
 * Restores a backup file selected in a file input.
 * Resolves `true` once the data is restored, `false` if no file was selected.
 * Rejects if the file cannot be read or is not a valid backup.
 */
export async function Restore(event: Event): Promise<boolean> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return false;

    const text = await file.text();
    const json = validateBackup(JSON.parse(text));
    await restoreToLocals(json);
    return true;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks the shape of a parsed backup and fills in defaults for fields
 * that older backups may not contain.
 */
function validateBackup(raw: unknown): Store {
    if (!isPlainObject(raw)) throw new Error('Backup is not a JSON object.');
    if (!isPlainObject(raw.cong)) throw new Error('Backup has no congregation data.');

    const arrayOr = <T>(value: unknown, field: string): T[] => {
        if (value === undefined || value === null) return [];
        if (!Array.isArray(value)) throw new Error(`Backup field "${field}" is not a list.`);
        return value as T[];
    };
    const objectOr = <T>(value: unknown, field: string): T => {
        if (value === undefined || value === null) return {} as T;
        if (!isPlainObject(value)) throw new Error(`Backup field "${field}" is not an object.`);
        return value as T;
    };

    return {
        cong: raw.cong as unknown as Congregation,
        pubs: arrayOr<Publisher>(raw.pubs, 'pubs'),
        assignments: arrayOr<{ key: string, stored: unknown }>(raw.assignments, 'assignments'),
        events: arrayOr<string>(raw.events, 'events'),
        visits: arrayOr<string>(raw.visits, 'visits'),
        visitDetails: objectOr<VisitsDetails>(raw.visitDetails, 'visitDetails'),
        eventDetails: objectOr<EventsDetails>(raw.eventDetails, 'eventDetails'),
        overrides: arrayOr<Override>(raw.overrides, 'overrides'),
        overrideParts: arrayOr<PartItem>(raw.overrideParts, 'overrideParts'),
        overrideTimes: arrayOr<TimeOverride>(raw.overrideTimes, 'overrideTimes'),
    }
}

async function compose(): Promise<Store> {
    const congStore = useCongregationStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()
    const assignStore = useAssignmentStore()
    const pubStore = usePublisherStore()
    const overrides = useOverridesStore()
    const overrideParts = usePartsOverride()
    const overrideTimes = useTimeOverrides()

    return {
        cong: congStore.congregation,
        pubs: pubStore.publishers,
        assignments: await assignStore.fetchAllLocal(),
        events: eventStore.months,
        visits: visitStore.months,
        visitDetails: visitStore.details,
        eventDetails: eventStore.details,
        overrides: overrides.stored,
        overrideParts: overrideParts.stored,
        overrideTimes: overrideTimes.stored,
    }
}

async function restoreToLocals(json: Store) {
    const congStore = useCongregationStore()
    const eventStore = useEventStore()
    const visitStore = useVisitStore()
    const assignStore = useAssignmentStore()
    const pubStore = usePublisherStore()
    const overrides = useOverridesStore()
    const overrideParts = usePartsOverride()
    const overrideTimes = useTimeOverrides()

    congStore.congregation = json.cong
    eventStore.months = json.events
    eventStore.details = json.eventDetails
    visitStore.months = json.visits
    visitStore.details = json.visitDetails
    pubStore.pubs = json.pubs
    overrides.stored = json.overrides
    overrideParts.stored = json.overrideParts
    overrideTimes.stored = json.overrideTimes
    await assignStore.restore(json.assignments)

    // Reload the month on screen so the in-memory assignments match the
    // restored data; otherwise the next edit would save the old ones over it.
    const fileStore = useFilesStore()
    await fileStore.loadFiles()
    const hasPeriod = fileStore.langMonths.some(m => m.content.period === fileStore.currentPeriod)
    await fileStore.loadMonthTemplate(hasPeriod ? fileStore.currentPeriod : undefined)
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
        stored: unknown
    }[]
    events: string[]
    visits: string[]
    visitDetails: VisitsDetails
    eventDetails: EventsDetails
    overrides: Override[]
    overrideParts: PartItem[]
    overrideTimes: TimeOverride[]
}