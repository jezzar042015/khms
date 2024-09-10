import { translate } from "./translator.js"

const source = { code: 'ceb', display: "Cebuano" }
const target = { code: 'war', display: "Waraywaray" }

await translateCebToWaray()

export async function translateCebToWaray() {
    await translate(source, target)
}





