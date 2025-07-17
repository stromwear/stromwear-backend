import dotenvSafe from "dotenv-safe";
import path from "path";
dotenvSafe.config({
  path: path.resolve(__dirname, "..", ".env"),
  example: path.resolve(__dirname, "..", ".env.example"),
});

const PORT: string | undefined = process.env.PORT;
const MONGO_DB_URL: string | undefined = process.env.MONGO_DB_URL;
const CLIENT_SECRET_KEY: string | undefined = process.env.CLIENT_SECRET_KEY;
const ADMIN_SECRET_KEY: string | undefined = process.env.ADMIN_SECRET_KEY;
const GMAIL_USER:string | undefined = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD:string | undefined = process.env.GMAIL_APP_PASSWORD;
export default {
  PORT,
  MONGO_DB_URL,
  CLIENT_SECRET_KEY,
  ADMIN_SECRET_KEY,
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
};
