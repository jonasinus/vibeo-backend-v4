import { Instance } from './custom'

export function overrideConsole() {
    const originalConsoleInfo = console.info
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn

    console.info = (...args) => {
        args[0] = `\x1b[89m[I] ${args[0]}\x1b[0m` // Gray color
        originalConsoleInfo.apply(console, args)
    }

    console.error = (...args) => {
        args[0] = `\x1b[91m[E] ${args[0]}\x1b[0m` // Red color
        originalConsoleError.apply(console, args)
    }

    console.warn = (...args) => {
        args[0] = `\x1b[93m[W] ${args[0]}\x1b[0m` // Yellow color
        originalConsoleWarn.apply(console, args)
    }
}

export async function loadInstances() {
    let instances: Instance[] = []
    await fetch('https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md')
        .then((resp) => resp.text())
        .then((body) => {
            const lines = body.split('\n')
            for (let i = 4; i < lines.length - 1; i++) {
                let line = lines[i]
                let [name, apiurl, locations, cdn] = line.split(' | ')
                instances.push({ name, apiurl, locations, cdn: cdn === 'Yes' })
            }
        })
        .then((_) => {
            console.info('successfully installed instance data')
            let filteredInstances = instances.filter((instance) => instance.cdn)
            console.info(`${instances.length} instances available, ${filteredInstances.length} with CDN`)
        })
        .catch((err) => {
            console.error('error fetching backend-instance-data: ' + err)
        })
    return instances
}
