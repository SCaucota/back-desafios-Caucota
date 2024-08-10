import jwt from "jsonwebtoken";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import configObject from "../config/config.js";
import services from "../services/index.js";
import { EErrors } from "../services/errors/enum.js";
import {generateInfoErrorUser} from "../services/errors/info.js";
import CustomError from "../services/errors/customError.js";
import generarResetToken from "../utils/tokenreset.js";
import EmailManager from "../services/email.js";

const emailManager = new EmailManager();

class UserController {
   
   cambiarRolPremium = async (req, res) => {
       const {uid} = req.params;

       try {
           const user = await services.userService.getUserById(uid)

           if(!user) {
               return res.status(404).send("Usuario no encontrado");
           }

           const documentsName = user.documents.map(document => document.name);

           const docsRequired = [ "identificacion", "comprobantedomicilio", "comprobantedeestadodecuenta" ]

           const docs = docsRequired.every(doc => documentsName.includes(doc))

           if(user.role === "premium") {
                const newRole = user.role = "user";

                const actualizado = await services.userService.changeUserRol(uid, newRole)

                res.json(actualizado)

           }else if(user.role === "user") {

                if(docs) {
                    const newRole = user.role = "premium";

                    const actualizado = await services.userService.changeUserRol(uid, newRole)

                    res.json(actualizado)
                }else {
                    res.status(400).send("Faltan documentos por cargar")
                }   

           }

        } catch (error) {
           res.status(500).send("Error en el servidor" + error)
        }
    }

    deleteUser = async (req, res) => {
        try {
            const id = req.params.uid;
            console.log(id)
            const userCartId = req.user.cart._id;
            console.log(userCartId)
            await services.userService.deleteUser(id);
            await services.cartService.deleteCart(userCartId);
            res.status(200).send({meesage: "Se eliminó exitosamente el usuario"});

        } catch (error) {
            res.status(500).json({error: "Error en el servidor"});
        }

    };

    uploadUserDocuments = async (req, res) => {
        const userId = req.params.uid;
        const files = req.files;
        try {

            if(!userId) {
                return res.status(404).send("Usuario no encontrado");
            }

            if(!files) {
                return res.status(404).send("No se encontraron archivos");
            }

            await services.userService.uploadUserDocuments(userId, files);

            res.status(200).send({message: "Documentos cargados exitosamente"});
        } catch (error) {
            res.status(500).send("Error en el servidor" + error)
        }
    }
}

export default UserController;