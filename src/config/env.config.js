import dotenv from "dotenv";
import program from "../utils/commander.js"; 

const { mode } = program.opts(); 

dotenv.config({
    path: mode === "produccion" ? "src/.env.produccion":"src/.env.desarrollo"
});

const configObject = {
    puerto: process.env.PUERTO,
    mongo_url: process.env.MONGO_URL
}

export default configObject;