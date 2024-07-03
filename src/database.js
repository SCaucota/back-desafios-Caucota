import mongoose from "mongoose";
import configObject from "./config/config.js";
import { logger } from "./utils/logger.js";

mongoose.connect(configObject.MONGO_URL)
    .then(() => logger.info("Base de datos conectada"))
    .catch((error) => logger.fatal("Error al conectar la base de datos:", error))