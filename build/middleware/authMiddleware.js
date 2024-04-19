"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.prismaAuthToken;
        if (!token) {
            throw new Error("No token provided.");
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Attach userId to request for further processing
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(401).send("Invalid or expired token.");
    }
}
exports.authMiddleware = authMiddleware;
