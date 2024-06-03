import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
const router = express.Router();
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import services from "../services/index.js";

router.post("/register", async (req, res) => {
    const {first_name, last_name, email, age, role} = req.body;

    try{
        const existedUser = await UserModel.findOne({email}).lean();

        if (existedUser) {
            return res.status(400).send("El usuario ya existe");
        }

        const newCartId = await services.cartService.addCart();

        const newUser = new UserModel({
            first_name,
            last_name,
            email,
            age,
            password: createHash(req.body.password),
            cart: newCartId,
            role,
        });

        await newUser.save();

        const token = jwt.sign({email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, age: newUser.age, cart: newUser.cart, role: newUser.role}, "coderhouse", { expiresIn: "1h" });

        res.cookie("coderCookieToken", token, {
            maxAge: 3600000,
            httpOnly: true
        });

        res.redirect("/products");
    }catch (error) {
        res.status(500).send("Error interno del servidor");
    }
})

router.post("/login", async (req, res) => {
    
    if(req.cookies.coderCookieToken) {
        return res.redirect("/profile");
    }

    const {email, password} = req.body;
    try{
        const user = await UserModel.findOne({email}).lean();

        if(!user) {
            return res.status(400).send("El usuario no existe");
        }

        if(!isValidPassword(password, user)) {
            return res.status(401).send("Contraseña incorrecta");
        }

        const token = jwt.sign({email: user.email, first_name: user.first_name, last_name: user.last_name, age: user.age, cart: user.cart, role: user.role}, "coderhouse", {expiresIn: "1h"});

        res.cookie("coderCookieToken", token, {
            maxAge: 3600000,
            httpOnly: true
        });

        res.redirect("/products");
    }catch (error) {
        res.status(500).send("Error interno del servidor");
    }
})

router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));

router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login", session: false }), (req, res) => {
    const token = jwt.sign(
        {email: req.user.email, first_name: req.user.first_name, last_name: req.user.last_name, age: req.user.age, cart: req.user.cart,ole: req.user.role}, "coderhouse", {expiresIn: "1h"}
    )

    res.cookie("coderCookieToken", token, {
        maxAge: 3600000,
        httpOnly: true
    })

    res.redirect("/products");
})

router.get("/products", passport.authenticate("jwt", {session: false}), (req, res) => {
    res.render("products", {email: req.user.email});
})

router.post("/logout", (req, res) => {
    res.clearCookie("coderCookieToken"); 
    res.redirect("/login");
})

router.get("/admin", passport.authenticate("jwt", {session: false}), (req, res) => {
    if ( req.user.role !== "admin") {
        return res.status(403).send("Acceso Denegado");
    }
    res.render("admin");
})


export default router