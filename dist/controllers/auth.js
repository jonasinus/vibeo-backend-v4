"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const bcrypt_1 = __importStar(require("bcrypt"));
const db_1 = require("./db");
const db_2 = require("./db");
function createUser(username, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let uuid = createUUID(yield db_2.database.getAllUserUUIDs());
        let salt = createSalt();
        let passwordWithPepper = `${password}${process.env.PEPPER || db_1.FALLBACK.PEPPER}`;
        let hashedPassword = hash(passwordWithPepper, salt);
        let newUser = {
            uuid,
            username,
            email,
            hashedPassword,
            salt
        };
        console.log(newUser);
        db_2.database.createUser(newUser);
    });
}
exports.createUser = createUser;
function hash(passwordWithPepper, salt) {
    return (0, bcrypt_1.hashSync)(passwordWithPepper, salt);
}
function createSalt() {
    const salt_length = parseInt(process.env.SALT_LENGTH || db_1.FALLBACK.SALT_LENGTH.toString());
    return bcrypt_1.default.genSaltSync();
}
function createUUID(existingUUIDs) {
    const generateSegment = () => {
        return Math.floor(Math.random() * 0x10000)
            .toString(16)
            .padStart(4, '0');
    };
    while (true) {
        const newUUID = `${generateSegment()}-${generateSegment()}-${generateSegment()}-${generateSegment()}`;
        if (!existingUUIDs.includes(newUUID)) {
            return newUUID;
        }
    }
}
