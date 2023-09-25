import Express, { json } from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import cookies from 'cookie-parser'

import { router as authRouter } from './routers/auth'
import { router as dataRouter } from './routers/data'
import { FALLBACK } from './controllers/db'
import { loadInstances, overrideConsole } from './config.ts'
import { Instance } from './custom'
import { createUser } from './controllers/auth.ts'

config()
export let instances: Instance[] = []
async function startUp() {
    const port = process.env.PORT || FALLBACK.PORT

    await import('./config.ts')

    overrideConsole()
    instances = await loadInstances()
    instances = instances.filter((instance) => instance.apiurl.includes('piped-api.lunar.icu'))
    console.info(`using instance ${instances[0].name}`)

    const app = Express()
    const corsOptions = {
        origin: true,
        credentials: true
    }

    app.use(json())
    app.use(cookies())
    app.use(cors(corsOptions))

    app.use('/auth', authRouter)
    app.use('/data', dataRouter)

    app.listen(port, () => console.info('listening on port: ' + port))
}
startUp()

//test-user: {username: "jonas", email: "jonas.haardoerfer@outlook.de", password: "123"}
