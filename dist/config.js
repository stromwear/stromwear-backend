"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_safe_1 = __importDefault(require("dotenv-safe"));
const path_1 = __importDefault(require("path"));
dotenv_safe_1.default.config({
    path: path_1.default.resolve(__dirname, "..", ".env"),
    example: path_1.default.resolve(__dirname, "..", ".env.example"),
});
const PORT = process.env.PORT;
const MONGO_DB_URL = process.env.MONGO_DB_URL;
const CLIENT_SECRET_KEY = process.env.CLIENT_SECRET_KEY;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
exports.default = {
    PORT,
    MONGO_DB_URL,
    CLIENT_SECRET_KEY,
    ADMIN_SECRET_KEY,
    GMAIL_USER,
    GMAIL_APP_PASSWORD,
};
//# sourceMappingURL=config.js.map