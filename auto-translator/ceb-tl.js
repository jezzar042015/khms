import { translate } from "./translator.js"

const source = { code: 'ceb', display: "Cebuano" }
const target = { code: 'tl', display: "Tagalog" }

await translateCebToTagalog()

export async function translateCebToTagalog() {
    await translate(source, target)
}