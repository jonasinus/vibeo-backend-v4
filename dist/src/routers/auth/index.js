"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const jwt_1 = require("../../middleware/jwt");
exports.router = (0, express_1.default)();
exports.router.post('/signin', (req, res) => {
    let { username, password } = req.body;
    if (!username)
        return res.status(401).json({ error: 'no username provided', fatal: true });
    if (!password)
        return res.status(401).json({ error: 'no password provided', fatal: true });
    let token = (0, jwt_1.createToken)({ username, password });
    res.cookie('token', token);
    res.status(200).json({ msg: 'signin successful' });
});
exports.router.post('/signout', jwt_1.verifyTokenMiddleware, (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ msg: 'signout successful' });
});
exports.router.post('/verifyToken', jwt_1.verifyTokenMiddleware, (req, res) => {
    res.status(200).json({ msg: 'token valid' });
});
