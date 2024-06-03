import jwt from "jsonwebtoken";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import configObject from "../config/config.js";
import services from "../services/index.js";

class UserManager {

    register = async (req, res) => {
        try {
            const { first_name, last_name, email, age, role } = req.body;

            const existedUser = await services.userService.getUserByEmail(email).lean();

            if (existedUser) {
                return res.status(400).send("El usuario ya existe");
            }

            const newCartId = await services.cartService.addCart();

            const newUser = { first_name, last_name, email, age, password: createHash(req.body.password), cart: newCartId, role };

            await services.userService.createUser(newUser);

            const token = jwt.sign({ email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, age: newUser.age, cart: newUser.cart, role: newUser.role }, configObject.JWT_SECRET, { expiresIn: "1h" });

            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/products");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    login = async (req, res) => {
        try {
            if (req.cookies.coderCookieToken) {
                return res.redirect("/profile");
            }

            const { email, password } = req.body;

            const user = await services.userService.getUserByEmail(email);

            if (!user) {
                return res.status(400).send("El usuario no existe");
            }

            if (!isValidPassword(password, user)) {
                return res.status(401).send("Contraseña incorrecta");
            }

            const token = jwt.sign({ email: user.email, first_name: user.first_name, last_name: user.last_name, age: user.age, cart: user.cart, role: user.role }, configObject.JWT_SECRET, { expiresIn: "1h" });

            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/products");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    githubcallback = async (req, res) => {
        try {
            const token = jwt.sign(
                {email: req.user.email, first_name: req.user.first_name, last_name: req.user.last_name, age: req.user.age, cart: req.user.cart,ole: req.user.role}, configObject.JWT_SECRET, {expiresIn: "1h"}
            )
    
            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            })
        
            res.redirect("/products");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    logout = (req, res) => {
        try {
            res.clearCookie("coderCookieToken"); 
            res.redirect("/login");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    adminAccess = (req, res) => {
        try {
            if ( req.user.role !== "admin") {
                return res.status(403).send("Acceso Denegado");
            }
            res.render("admin");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }
}

export default UserManager;