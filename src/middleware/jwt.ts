import { sign, verify, decode } from 'jsonwebtoken'
import { FALLBACK } from '../controllers/db'
import { NextFunction, Response, Request } from 'express'

export function createToken(data: any) {
    data.timestamp = Date.now()
    let token = sign(data, process.env.SECRET || FALLBACK.SECRET)
    return token
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token
    console.log(token)
    let verified = verify(token, process.env.SECRET || FALLBACK.SECRET)
    next()
}
