import mongoose from "mongoose";

mongoose.connect("mongodb+srv://masocaucota:caucotaAlways@cluster0.obhprab.mongodb.net/Ecommerce?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Base de datos conectada"))
    .catch((error) => console.log("Error al conectar la base de datos:", error))