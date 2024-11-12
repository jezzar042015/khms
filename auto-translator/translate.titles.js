import { getFiles, read, write } from "./files-scanner.js";
import { printer } from "./printer.js";
import { titles } from "./translations-titles.js";

export async function setTitles(langs = ['psp'], months = []) {

    if (months.length == 0) {
        printer('No months indicated!', 'magenta');
        printer('----');
        return
    }

    for (const lang of langs) {
        const files = await getFiles(`./src/lib/${lang}`);
        const targetFiles = files.filter(f => months.includes(f.split('.')[0].toString()))

        for (const targetFile of targetFiles) {

            const monthId = targetFile.split('.')[0].toString()

            const affectedTitles = titles
                .filter(t => t.id.split(".")[0].toString() == monthId)
                .map(t => ({ id: t.id, [lang]: t[lang] }));

            const dir = `./src/lib/${lang}/${targetFile}`;
            let content = await read(dir)
            content = JSON.parse(content)

            for (const title of affectedTitles) {
                const weekId = title.id.substring(0, 8)
                const week = content.weeks.find(w => w.id === weekId)

                if (week) {
                    for (const meetingPart in week.parts) {
                        const parts = week.parts[meetingPart]
                        const part = parts.find(p => p.id == title.id)

                        if (part) {
                            part.title = title[lang]
                        }
                    }

                }
            }

            await write(dir, JSON.stringify(content, null, 4));

        }
    }

}