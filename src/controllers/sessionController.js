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

class SessionController {
    register = async (req, res, next) => {
        try {
            const { first_name, last_name, email, age } = req.body;

            if(!first_name || !last_name || !email || !age) {
                throw CustomError.createError({
                    name: "Registro Usuario",
                    cause: generateInfoErrorUser({first_name, last_name, email, age}),
                    mensage: "Error en el registro. El usuario tiene algunos datos incompletos ",
                    code: EErrors.USER_REGISTER_ERROR
                })
            }

            const existedUser = await services.userService.getUserByEmail(email);

            if (existedUser) {
                throw CustomError.createError({
                    name: "Email duplicado",
                    cause: `El email: ${email} ya está en uso`,
                    message: "Usuario duplicado",
                    code: EErrors.USER_ALREADY_EXIST
                })
            }

            const newCartId = await services.cartService.addCart();

            const newUser = { first_name, last_name, email, age, password: createHash(req.body.password), cart: newCartId};

            await services.userService.createUser(newUser);

            const token = jwt.sign({ email: newUser.email, first_name: newUser.first_name, last_name: newUser.last_name, age: newUser.age, cart: newUser.cart }, configObject.JWT_SECRET, { expiresIn: "1h" });

            res.cookie("coderCookieToken", token, {
                maxAge: 3600000,
                httpOnly: true
            });

            res.redirect("/products");
        } catch (error) {
            next(error)
        }
    }

    login = async (req, res) => {
        try {
            if (req.cookies.coderCookieToken) {
                return res.redirect("/profile");
            }

            const { email, password } = req.body;

            if (email === configObject.ADMIN_EMAIL && password === configObject.ADMIN_PASSWORD) {
                const token = jwt.sign({
                    email: configObject.ADMIN_EMAIL,
                    role: 'admin'
                }, configObject.JWT_SECRET, { expiresIn: '1h' });

                res.cookie("coderCookieToken", token, {
                    maxAge: 3600000,
                    httpOnly: true
                });

                return res.redirect("/realtimeproducts")
            }

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

            const lastConnection = user.last_connection = new Date(Date.now());

            await services.userService.updateLastUserConnection(user._id, lastConnection);

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

    logout = async (req, res) => {
        try {
            if(req.user) {
                const user = req.user
                const lastConnection = user.last_connection = new Date(Date.now());
                await services.userService.updateLastUserConnection(user._id, lastConnection);
                res.clearCookie("coderCookieToken"); 
                res.redirect("/login");
            }
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    adminAccess = (req, res) => {
        try {
            if ( req.user.role !== "admin") {
                return res.status(404).send("Acceso Denegado");
            }
            res.render("admin");
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    requestPasswordReset = async (req, res) => {
        const {email} = req.body;
        try {
            const user = await services.userService.getUserByEmail(email);

            if(!user) {
                return res.status(404).send("El usuario no existe");
            }

            const token = generarResetToken();

            user.resetToken = {
                token: token,
                expire: new Date(Date.now() + 3600000)
            }

            await services.userService.updateToken(user._id, user);

            await emailManager.enviarCorreoRestablecimiento(email, user.first_name, token);
            

            res.redirect("/confirmacionEnvio")
        } catch (error) {
            res.status(500).send("Error interno del servidor" + error);
        }
    }

    resetPassword = async (req, res) => {
        const {email, password, password2, token} = req.body;

        try {
            const user = await services.userService.getUserByEmail(email);

            if(!user) {
                return res.render("changePassword", {error: "El usuario no existe"});
            }

            const resetToken = user.resetToken;

            if(!resetToken || resetToken.token !== token) {
                return res.render("resetpassword", {error: "Token invalido"});
            }

            const ahora = new Date();

            if(ahora > resetToken.expire) {
                return res.render("resetpassword", {error: "Token expirado"});
            }

            if(isValidPassword(password, user)) {
                return res.render("changePassword", {error: "La contraseña no puede ser la misma que la anterior"});
            }

            if(password !== password2) {
                return res.render("changePassword", {error: "Las contraseñas no coinciden"});
            }

            user.password = createHash(password);

            user.resetToken = undefined;

            await services.userService.updateUser(user._id, user.password, user.resetToken);

            return res.redirect("/login");
        } catch (error) {
            res.status(500).render("resetpassword").send("Error interno del servidor");
        }
    }
}

export default SessionController;