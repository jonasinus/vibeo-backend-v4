import { randomBytes } from 'crypto'
import bcrypt, { hashSync } from 'bcrypt'
import { FALLBACK, User } from './db'
import { database } from './db'

export async function createUser(username: string, email: string, password: string) {
    let uuid = createUUID(await database.getAllUserUUIDs())
    let salt = createSalt()
    let passwordWithPepper = pepperize(password)
    let hashedPassword = hash(passwordWithPepper, salt)

    let newUser: User = {
        uuid,
        username,
        email,
        hashedPassword,
        salt
    }

    console.log(newUser)
    database.createUser(newUser)
}

export function pepperize(password: string) {
    return `${password}${process.env.PEPPER || FALLBACK.PEPPER}`
}

export function hash(passwordWithPepper: string, salt: string) {
    return hashSync(passwordWithPepper, salt)
}

function createSalt() {
    return bcrypt.genSaltSync()
}

function createUUID(existingUUIDs: string[]): string {
    const generateSegment = (): string => {
        return Math.floor(Math.random() * 0x10000)
            .toString(16)
            .padStart(4, '0')
    }

    while (true) {
        const newUUID = `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`

        if (!existingUUIDs.includes(newUUID)) {
            return newUUID
        }
    }
}
