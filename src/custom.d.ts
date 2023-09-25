declare namespace Express {
    export interface Request {
        tokenData?: any
    }
}
export type Instance = {
    name: string
    apiurl: string
    locations: string
    cdn: boolean
}
