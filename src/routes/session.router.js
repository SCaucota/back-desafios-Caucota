import express from "express";
import userModel from "../models/user.model.js";
import { isValidPassword } from "../utils/hashbcrypt.js";
import passport from "passport";
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

                const role = email === "adminCoder@coder.com" && password === "adminCod3r123" ? "admin" : "user";
            
                if(role === "admin"){
                    req.session.user.isAdmin = true
                }

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

router.post("/login", passport.authenticate("login", {
    failureRedirect: "/faillogin",
}), async (req, res) => {
    if(!req.user){
        return res.status(400).send("Credenciales invalidas");
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role
    };

    req.session.login = true;

    res.redirect("/profile");
});

router.get("/faillogin", (req, res) => {
    res.send("Credenciales invalidas");
});

router.get("/github", passport.authenticate("github", {scope: ["user:email"]}), async (req, res) => {});

router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"}),
    async (req,res) => {
        req.session.user = req.user;
        req.session.login = true;
        res.redirect("/profile");
    })

export default router;