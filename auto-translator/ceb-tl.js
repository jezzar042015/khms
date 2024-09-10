import { getFiles } from "./files-scanner.js";
import { translations } from "./translations.js";

const source = { code: 'ceb', display: "Cebuano" }
const target = { code: 'tl', display: "Tagalog" }

printer(`Translating: ${source.display} to ${target.display}`, "green")

// get target lang files array
const files = await getFiles(`./src/lib/${target.code}`)


// iterate on files
for (const file of files) {
    const dir = `./src/lib/${target.code}/${file}`;
    

    for (const t of translations) {
        printer(`${t[source.code]} >> ${t[target.code]}`, "magenta");
    }
}

// apply replace
// save document

printer('Translation Completed!', "green")
printer('')

function printer(target, color = "default") {
    const colors = {
        default: '\x1b[0m',
        green: '\x1b[32m%s\x1b[0m',
        magenta: '\x1b[35m'
    }
    console.log(colors[color], target);
}