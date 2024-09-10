import { translate } from "./translator.js"

const source = { code: 'ceb', display: "Cebuano" }
const target = { code: 'tl', display: "Tagalog" }

await translate(source, target)