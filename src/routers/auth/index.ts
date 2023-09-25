import Express, { NextFunction, Request, Response } from 'express'
import { createToken, verifyToken } from '../../middleware/jwt'
import { JwtPayload, sign, verify } from 'jsonwebtoken'
import { User, database } from '../../controllers/db'
import { hash, pepperize } from '../../controllers/auth'

export function addHoursToDate(date: Date, h: number) {
    date.setTime(date.getTime() + h * 60 * 60 * 1000)
    return date
}

export const router = Express()

interface Req extends Express.Request {
    decoded?: any // Replace 'any' with your expected type
    body: { [key: string]: string }
    cookies: { [key: string]: string }
}

const secretKey = 'your-secret-key'

const authorize = (req: Req, res: Response, next: NextFunction) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({ message: 'no token provided' })
    }

    verify(token, secretKey, (err: unknown, decoded: string | JwtPayload | undefined) => {
        if (err) {
            return res.status(401).json({ message: 'invalid token' })
        }
        req.decoded = decoded
        next()
    })
}

router.post('/login', async (req: Req, res: Response) => {
    const { username, email, password } = req.body

    if (!username && !email) return res.status(400).json({ message: 'email or username must bwe provided' })
    if (!password) return res.status(400).json({ message: 'password must be provided' })

    let user: User | null = null

    if (!email) {
        user = (await database.findUserByUsername(username))[0]
    } else if (!username) {
        user = (await database.findUserByEmail(email))[0]
    }

    if (user === null) {
        //no user with that username / email found
        return res.status(401).json({ message: 'invalid credentials' })
    }

    let pepperized = pepperize(password)
    let salted = hash(pepperized, user.salt)
    if (salted != user.hashedPassword) return res.status(401).json({ message: 'invalid credentials' })

    const token = sign({ userId: user }, secretKey, { expiresIn: '1h' })

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    res.status(200).json({ message: 'login successful' })
})

router.post('/logout', authorize, (req, res) => {
    res.clearCookie('token')
    res.status(200).json({ message: 'logout successful' })
})

router.get('/verify', authorize, (req: Req, res) => {
    res.status(200).json({ message: 'token valid', user: req.decoded })
})
