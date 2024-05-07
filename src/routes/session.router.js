import express from "express";
import userModel from "../models/user.model.js";
import { isValidPassword } from "../utils/hashbcrypt.js";
const router = express.Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try{
        const user = await userModel.findOne({ email: email });
        if(user) {
            if(isValidPassword(password, user)) {
                req.session.login = true;
                req.session.user = {
                    email: user.email,
                    age: user.age,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role
                };
                res.redirect("/products");
            }else {
                res.status(401).send({ error: "Contraseña incorrecta" });
            }
        }else {
            res.status(404).send({ error: "Usuario no encontrado" });
        }
    }catch (error) {
        res.status(400).send({ error: "Error interno del servidor" });
    }
});

router.get("/logout", (req, res) => {
    if(req.session.login) {
        req.session.destroy();
    }
    res.redirect("/login");
});

export default router;