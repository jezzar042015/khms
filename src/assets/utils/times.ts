interface TimeOption { id: string, name: string }

export async function meetingTimes(): Promise<TimeOption[]> {

    const times = [];
    let hours = 8;
    let minutes = 0;

    while (hours < 20 || (hours === 20 && minutes === 0)) {
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const id = `${formattedHours}:${formattedMinutes}`;
        const period = hours < 12 ? ' AM' : ' PM';
        const displayHours = hours % 12 === 0 ? 12 : hours % 12;
        const name = `${displayHours}:${formattedMinutes}${period}`;

        times.push({ id, name });

        minutes += 15;
        if (minutes >= 60) {
            minutes = 0;
            hours += 1;
        }
    }

    return times;
} 