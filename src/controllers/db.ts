import mariadb, { Pool, PoolConnection } from 'mariadb'
class Database {
    private pool: Pool

    readonly tables = {
        users: {
            title: 'users',
            description: 'users table, stores all data about users',
            columns: ['uuid', 'email', 'password_hash', 'salt']
        }
    }

    private userUUIDsCache: string[] = []

    constructor(private config: mariadb.PoolConfig) {
        this.pool = mariadb.createPool(config)
    }

    async getConnection(): Promise<PoolConnection> {
        try {
            const connection = await this.pool.getConnection()
            return connection
        } catch (error) {
            throw new Error(`Error connecting to the database: ${error as Error}`)
        }
    }

    async executeQuery(query: string, params?: any[]): Promise<any> {
        let connection: PoolConnection | undefined

        try {
            connection = await this.getConnection()
            const result = await connection.query(query, params)
            return result
        } catch (error) {
            throw new Error(`Error executing the query: ${error as Error}`)
        } finally {
            if (connection) {
                connection.release() // Release the connection back to the pool
            }
        }
    }

    async getAllUserUUIDs(): Promise<string[]> {
        if (this.userUUIDsCache.length === 0) {
            const query = `SELECT uuid FROM ${database.tables.users.title}`
            try {
                const rows = await database.executeQuery(query)
                const uuids = rows.map((row: any) => row.uuid)
                this.userUUIDsCache = rows.map((row: any) => row.uuid)
                return uuids
            } catch (error) {
                throw new Error(`Error fetching user UUIDs: ${error as Error}`)
            }
        } else {
            return this.userUUIDsCache
        }
    }

    async createUser(user: User) {
        try {
            const query = `INSERT INTO ${database.tables.users.title} (uuid, username, email, hashedPassword, salt) VALUES(?, ?, ?, ?, ?  )`
            const params = [user.uuid, user.username, user.email, user.hashedPassword, user.salt]
            const rows = await database.executeQuery(query, params)
            console.log(rows)
        } catch (error) {
            throw new Error(`Error creating new user: ${error as Error}`)
        }
    }

    async findUserByEmail(email: string): Promise<User[]> {
        try {
            const query = `SELECT * FROM ${database.tables.users.title} WHERE email = ?`
            const params = [email]
            const rows = await database.executeQuery(query, params)
            return rows
        } catch (error) {
            throw new Error(`Error searching user by email: ${error as Error}`)
        }
    }

    async findUserByUsername(name: string): Promise<User[]> {
        try {
            const query = `SELECT * FROM ${database.tables.users.title} WHERE username = ?`
            const params = [name]
            const rows = await database.executeQuery(query, params)
            return rows
        } catch (error) {
            throw new Error(`Error searching user by username: ${error as Error}`)
        }
    }

    async findUserByUUID(uuid: string): Promise<User[]> {
        try {
            const query = `SELECT * FROM ${database.tables.users.title} WHERE uuid = ?`
            const params = [uuid]
            const rows = await database.executeQuery(query, params)
            return rows
        } catch (error) {
            throw new Error(`Error searching user by uuid: ${error as Error}`)
        }
    }

    async closePool(): Promise<void> {
        await this.pool.end()
    }
}

export const FALLBACK = {
    SECRET: 'secret',
    PORT: 3000,
    SALT_LENGTH: 16,
    DATABASE: { USER: 'vibeo', PASSWORD: 'password', HOST: 'localhost', DATABASE: 'vibeo' },
    PEPPER: 'pepper'
}

export interface User {
    uuid: string
    username: string
    email: string
    hashedPassword: string
    salt: string
}

const dbConfig: mariadb.PoolConfig = {
    host: process.env.DATABASE_HOST || FALLBACK.DATABASE.HOST,
    user: process.env.DATABASE_USER || FALLBACK.DATABASE.USER,
    password: process.env.DATABASE_PASSWORD || FALLBACK.DATABASE.PASSWORD,
    database: process.env.DATABASE_DATABASE || FALLBACK.DATABASE.DATABASE
}

process.on('exit', () => {
    database.closePool().then(() => {
        console.log('Database pool closed.')
    })
})

export const database = new Database(dbConfig)
