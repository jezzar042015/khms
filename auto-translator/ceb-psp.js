import { translate } from "./translator.js"

const source = { code: 'ceb', display: "Cebuano" }
const target = { code: 'psp', display: "FSL" }

await translateCebToFSL()

export async function translateCebToFSL() {
    await translate(source, target)
}
