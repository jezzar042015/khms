export function printer(target, color = "default") {
    const colors = {
        default: '\x1b[0m',
        green: '\x1b[32m%s\x1b[0m',
        magenta: '\x1b[35m'
    }
    console.log(colors[color], target);
}