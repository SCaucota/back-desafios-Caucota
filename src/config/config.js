import dotenv from "dotenv";

dotenv.config();

const configObject = {
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    MAILING_USER: process.env.MAILING_USER,
    MAILING_PASSWORD: process.env.MAILING_PASSWORD
}

export default configObject;