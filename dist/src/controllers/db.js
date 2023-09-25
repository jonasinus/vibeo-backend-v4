"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.FALLBACK = void 0;
const mariadb_1 = __importDefault(require("mariadb"));
class Database {
    constructor(config) {
        this.config = config;
        this.tables = {
            users: {
                title: 'users',
                description: 'users table, stores all data about users',
                columns: ['uuid', 'email', 'password_hash', 'salt']
            }
        };
        this.userUUIDsCache = [];
        this.pool = mariadb_1.default.createPool(config);
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield this.pool.getConnection();
                return connection;
            }
            catch (error) {
                throw new Error(`Error connecting to the database: ${error}`);
            }
        });
    }
    executeQuery(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection;
            try {
                connection = yield this.getConnection();
                const result = yield connection.query(query, params);
                return result;
            }
            catch (error) {
                throw new Error(`Error executing the query: ${error}`);
            }
            finally {
                if (connection) {
                    connection.release(); // Release the connection back to the pool
                }
            }
        });
    }
    getAllUserUUIDs() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.userUUIDsCache.length === 0) {
                const query = `SELECT uuid FROM ${exports.database.tables.users.title}`;
                try {
                    const rows = yield exports.database.executeQuery(query);
                    const uuids = rows.map((row) => row.uuid);
                    this.userUUIDsCache = rows.map((row) => row.uuid);
                    return uuids;
                }
                catch (error) {
                    throw new Error(`Error fetching user UUIDs: ${error}`);
                }
            }
            else {
                return this.userUUIDsCache;
            }
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = `INSERT INTO ${exports.database.tables.users.title} (uuid, username, email, password_hash, salt) VALUES(?, ?, ?, ?, ?  )`;
                const params = [user.uuid, user.username, user.email, user.hashedPassword, user.salt];
                const rows = yield exports.database.executeQuery(query, params);
                console.log(rows);
            }
            catch (error) {
                throw new Error(`Error creating new user: ${error}`);
            }
        });
    }
    closePool() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.end();
        });
    }
}
exports.FALLBACK = {
    SECRET: 'secret',
    PORT: 3000,
    SALT_LENGTH: 16,
    DATABASE: { USER: 'vibeo', PASSWORD: 'password', HOST: 'localhost', DATABASE: 'vibeo' },
    PEPPER: 'pepper'
};
const dbConfig = {
    host: process.env.DATABASE_HOST || exports.FALLBACK.DATABASE.HOST,
    user: process.env.DATABASE_USER || exports.FALLBACK.DATABASE.USER,
    password: process.env.DATABASE_PASSWORD || exports.FALLBACK.DATABASE.PASSWORD,
    database: process.env.DATABASE_DATABASE || exports.FALLBACK.DATABASE.DATABASE
};
process.on('exit', () => {
    exports.database.closePool().then(() => {
        console.log('Database pool closed.');
    });
});
exports.database = new Database(dbConfig);
