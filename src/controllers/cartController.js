import services from "../services/index.js";
import nodemailer from "nodemailer";
import twilio from "twilio";
import configObject from "../config/config.js";
import CustomError from "../services/errors/customError.js";
import { EErrors } from "../services/errors/enum.js";
class cartController {
    addCart = async (req, res, next) => {
        try {
            await services.cartService.addCart();
            res.status(200).send({ message: "Carrito creado con éxito" });
        } catch (error) {
            res.status(500).send({ error: "Error al agregar un nuevo carrito" });
        }
    }

    addProductToCart = async (req, res, next) => {
        try {
            const productId = req.params.pid;
            const cartId = req.params.cid;
            const quantity = req.body.quantity || 1;

            const cart = await services.cartService.addProductToCart(cartId, productId, quantity);

            if (!cart) {
                return res.status(404).send({ error: `Carrito con ID "${cartId}" no encontrado` });
            }

            res.redirect("/carts/" + cartId);
        } catch (error) {
            res.status(500).send({ error: "Error al agregar el producto" });
        }
    }

    getCartProducts = async (req, res) => {
        try {
            const id = req.params.cid

            const cart = await services.cartService.getCartProducts(id);

            if (!cart) {
                console.error(`El carrito con ID "${id}" no existe.`);
                return;
            }

            res.json(cart);
        } catch (error) {
            res.status(500).send({ error: "Error al obtener los productos del carrito" });
        }
    };

    updateProductsInCart = async (req, res) => {
        try {
            const id = req.params.cid;
            const updatedProducts = req.body;

            const cart = await services.cartService.updateProductsInCart(id, updatedProducts);

            if (!cart) {
                return res.status(404).send({ error: "Carrito no encontrado" });
            };

            res.json(cart);
        } catch (error) {
            res.status(500).send({ error: "Error al actualizar los productos del carrito" });
        }
    }

    updateAProductInCart = async (req, res) => {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;
            const quantity = req.body.quantity;

            const cart = await services.cartService.updateAProductInCart(cartId, productId, quantity);

            if (!cart) {
                console.error(`El carrito con ID "${id}" no existe`);
                return null;
            };

            res.status(200).send({ message: "Producto actualizado exitosamente" });
        } catch (error) {
            res.status(500).send({ error: "Error al cambiar la cantidad del producto" });
        }

    }

    deleteProductFromCart = async (req, res) => {
        try {
            const cartId = req.params.cid;
            const productId = req.params.pid;

            const cart = await services.cartService.deleteProductFromCart(cartId, productId);

            if (!cart) {
                console.error(`El carrito con ID "${cartId}" no existe`);
                return null;
            }

            res.status(200).send({ message: "Producto eliminado exitosamente" });
        } catch (error) {
            res.status(500).send({ error: "Error al eliminar el producto del carrito" });
        }
    }

    deleteProductsCart = async (req, res) => {
        try {
            const id = req.params.cid

            const cart = await services.cartService.deleteProductsCart(id);

            if (!cart) {
                console.error(`El carrito con ID "${id}" no existe`);
                return null;
            }

            res.render("products", { status: "success", message: "Carrito eliminado exitosamente" });
        } catch (error) {
            res.status(500).send({ error: "Error al eliminar los productos del carrito" });
        }
    }
    

    purchaseCart = async (req, res) => {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: configObject.MAILING_USER,
                pass: configObject.MAILING_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        const client = twilio(configObject.TWILIO_ACCOUNT_SID, configObject.TWILIO_AUTH_TOKEN);

        try {
            const cartId = req.params.cid;
            const userEmail = req.user.email;
            const result = await services.cartService.purchaseCart(cartId, userEmail);

            if(result.isEmpty) {
                res.render("checkout", {isEmpty: true})
            }else{
                const {ticketData, unprocessedProducts} = result;

                const ticket = await services.ticketService.generateTicket(ticketData);

                const mailOptions = {
                    from: configObject.MAILING_USER,
                    to: "nutellitadivergente@gmail.com",
                    subject: "Ticket de compra",
                    html: `
                        <h1>Ticket de compra: ${ticket._id}</h1>
                        <h2>Tu compra se generó exitosamente</h2>
                        <h2>¡Muchas gracias por tu compra!</h2>
                    `
                };

                await transporter.sendMail(mailOptions);
                await client.messages.create({
                    body: `Su compra se realizó exitosamente: ${ticket._id} ¡Muchas gracias por tu compra!`,
                    from: configObject.TWILIO_SMS_NUMBER,
                    to: "+543517887437"
                });

                res.render("checkout", { isEmpty: false, ticketId: ticket._id, unprocessedProducts, cartId });
            }
        } catch (error) {
            res.status(500).send({ error: `Error al realizar la compra del carrito Controller: ${error.message}` });
        }
    }
}

export default cartController;