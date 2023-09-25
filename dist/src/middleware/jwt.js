"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenMiddleware = exports.decodeToken = exports.verifyToken = exports.createToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const db_1 = require("../controllers/db");
const console_1 = require("console");
function createToken(data) {
    data.timestamp = Date.now();
    let token = (0, jsonwebtoken_1.sign)(data, process.env.SECRET || db_1.FALLBACK.SECRET);
    return token;
}
exports.createToken = createToken;
function verifyToken(token) {
    try {
        let verified = (0, jsonwebtoken_1.verify)(token, process.env.SECRET || db_1.FALLBACK.SECRET);
        return verified;
    }
    catch (_a) { }
    return null;
}
exports.verifyToken = verifyToken;
function decodeToken(token) {
    try {
        let decoded = (0, jsonwebtoken_1.decode)(token, { json: true });
        return decoded;
    }
    catch (_a) { }
    return null;
}
exports.decodeToken = decodeToken;
function verifyTokenMiddleware(req, res, next) {
    (0, console_1.log)(req.cookies);
    if (req.cookies == undefined || req.cookies.length == 0 || req.cookies.token == undefined) {
        return res.status(401).json({ error: 401, msg: 'no token provided' });
    }
    let tokenData = verifyToken(req.cookies.token);
    if (tokenData !== null) {
        next();
    }
    return res.status(403).json({ error: 403, msg: 'unauthorized' });
}
exports.verifyTokenMiddleware = verifyTokenMiddleware;
