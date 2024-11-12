import { translateCebToFSL } from "./ceb-psp.js";
import { translateCebToTagalog } from "./ceb-tl.js";
import { translateCebToWaray } from "./ceb-war.js";
import { setTitles } from "./translate.titles.js";

await translateCebToFSL()
await translateCebToTagalog()
await translateCebToWaray()
await setTitles()