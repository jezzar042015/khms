import { getFiles, read, replace, write } from "./files-scanner.js";
import { printer } from "./printer.js";
import { translations } from "./translations.js";

export async function translate(source, target) {
    printer(`Translating: ${source.display} to ${target.display}`, "green");

    const files = await getFiles(`./src/lib/${target.code}`);

    for (const file of files) {
        const dir = `./src/lib/${target.code}/${file}`;
        let content = await read(dir)
        let overallFileChanges = 0;
        printer(dir, "green");

        for (const t of translations) {
            const searchText = t[source.code]
            const replaceText = t[target.code]
            if (searchText == replaceText) continue;
            
            const changes = await replace(content, searchText, replaceText)
            content = changes.content;
            
            if (changes.occurrences > 0) {
                printer(`--------------`);
                printer(`Search: ${searchText}`, "magenta");
                printer(`Translation: ${t[target.code]}`, "magenta");
                printer(`## ${changes.occurrences} occurences`)
                overallFileChanges += changes.occurrences
            }
        }

        if (overallFileChanges == 0) {
            printer(`No changes applied to file!`)
        } else {
            await write(dir, content);
            printer(`## ${overallFileChanges} file changes`)
            printer(`File successfully written: ${dir}`, "green");
        }
        printer(`--------------`);
    }



    printer('Translation Completed!', "green")
    printer('')
}

