import { Router } from 'express'
import { instances } from '../..'
import { clearCache, saveToCache } from '../../controllers/cache'
import { verifyToken } from '../../middleware/jwt'

export const router = Router()

router.get('/', (req, res) => {
    return res.status(200).send('hello world')
})

router.get('/streams/:id', async (req, res) => {
    const forceRevalidate = req.query.forceRevalidate
    let instance = instances[0]
    let requestUrl = instance.apiurl + `/streams/${req.params.id}`
    console.info('using instance:', instance.apiurl)
    console.info('ressource path:', requestUrl)
    let result = await (await fetch(requestUrl, { referrerPolicy: 'no-referrer' })).json()
    saveToCache('streams', result)
    return res.status(200).json({ hello: 'world', id: req.params.id, result })
})

router.post('/cache/clear', verifyToken, (req, res) => {
    try {
        clearCache()
        res.status(200).json({ message: `cache cleared, revalidating`, expectedCompletionTime: 1000 * 60 * 60 * 5 })
    } catch (err) {
        res.status(500).json({ error: err, message: 'operation failed', fatal: true })
    }
})
