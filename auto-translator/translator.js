import { getFiles, read, replace } from "./files-scanner.js";
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
                printer(`${searchText} >> ${t[target.code]}`, "magenta");
                printer(`${changes.occurrences} occurences`)
                overallFileChanges += changes.occurrences
            }
        }

        if (overallFileChanges == 0) {
            printer(`No changes applied to file!`)
        } else {
            printer(`${overallFileChanges} file changes`)
        }
        printer(`--------------`);
    }

    // apply replace
    // save document

    printer('Translation Completed!', "green")
    printer('')
}

function printer(target, color = "default") {
    const colors = {
        default: '\x1b[0m',
        green: '\x1b[32m%s\x1b[0m',
        magenta: '\x1b[35m'
    }
    console.log(colors[color], target);
}