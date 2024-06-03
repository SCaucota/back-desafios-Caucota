import mongoose from "mongoose";
import configObject from "./config/config.js";

mongoose.connect(configObject.MONGO_URL)
    .then(() => console.log("Base de datos conectada"))
    .catch((error) => console.log("Error al conectar la base de datos:", error))