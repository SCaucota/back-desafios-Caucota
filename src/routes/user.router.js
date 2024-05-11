import express from "express";
import userModel from "../models/user.model.js";
import { createHash } from "../utils/hashbcrypt.js";
import passport from "passport";
const router = express.Router();
/* 
router.post("/register", async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    try {
        const existingUser = await userModel.findOne({ email: email });
        if(existingUser) {
            res.status(400).send({ error: "Ya existe un usuario con ese correo" });
        }

        const role = email === "adminCoder@coder.com" && password === "adminCod3r123" ? "admin" : "user";

        const newUser = await userModel.create({
            first_name,
            last_name,
            email,
            password: createHash(password),
            age,
            role
        })

        req.session.login = true;
        req.session.user = { ...newUser._doc };

        if(role === "admin"){
            req.session.user.isAdmin = true
        }

        res.redirect("/products");
    }catch (error) {
        console.log("Eerror al crear el usuario", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
}); */

router.post("/register",  passport.authenticate("register", {
    failureRedirect: "/failregister",
}),async (req, res) => {
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
})

router.get("/failedregister", (req, res) => {
    res.send("Credenciales invalidas");
})

export default router