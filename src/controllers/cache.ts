import { readdirSync, unlink, unlinkSync } from 'fs'
import { join, resolve } from 'path'

export type CacheTypes = 'search' | 'suggestions' | 'streams' | 'comments' | 'trending'

function* iterateCacheTypes(): IterableIterator<CacheTypes> {
    for (const cacheType of ['search', 'suggestions', 'streams', 'comments', 'trending']) {
        yield cacheType as CacheTypes
    }
}

export const cachePath = join(resolve(), 'cache')

export function saveToCache(dataType: CacheTypes, data: Object) {
    let filePath = join(cachePath, dataType, Date.now().toString())
    console.log(filePath)
}

export function clearCache() {
    for (const cacheType of iterateCacheTypes()) {
        let directoryPath = join(cachePath, cacheType)
        let filesInFolder = readdirSync(directoryPath)
        for (const file of filesInFolder) {
            let filePath = join(directoryPath, file)
            unlinkSync(filePath)
        }
    }
}
