import services from "../services/index.js";
import nodemailer from "nodemailer";
import twilio from "twilio";
import configObject from "../config/config.js";
class cartController {
    addCart = async (req, res) => {
        try {
            await services.cartService.addCart();
            res.status(200).send({ message: "Carrito creado con éxito" });
        } catch (error) {
            res.status(500).send({ error: "Error al agregar un nuevo carrito" });
        }
    }

    addProductToCart = async (req, res) => {
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

        const TWILIO_ACCOUNT_SID = "AC68f461b832daa9ac56da4e89fad1f79a";
        const TWILIO_AUTH_TOKEN = "45c8ff52943ee8f7b95307cb708f0267";
        const TWILIO_SMS_NUMBER = "+12166267675"

        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        try {
            const cartId = req.params.cid;
            const { cart, productsSinStock } = await services.cartService.purchaseCart(cartId);

            if (cart.products.length !== 0) {
                const userEmail = req.user.email;

                function generateCode(length, chars) {
                    let code = [];
                    for (var i = 0; i < length; i++) {
                        let index = Math.floor(Math.random() * chars.length);
                        code.push(chars[index]);
                    }
                    return code.join('');
                }

                const amount = cart.products.reduce((total, productItem) => {
                    if (productItem.product.price) {
                        return total + (productItem.quantity * productItem.product.price);
                    }
                    return total;
                }, 0);

                
                const ticketCode = generateCode(10, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
                const ticketData = {
                    code: ticketCode,
                    purchase_datetime: Date.now(),
                    amount,
                    purchaser: userEmail
                };
                const ticket = await services.ticketService.generateTicket(ticketData);

                cart.products = productsSinStock;
                await cart.save();

                
                const mailOptions = {
                    from: configObject.MAILING_USER,
                    to: "nutellitadivergente@gmail.com",
                    subject: "Ticket de compra",
                    html: `
                        <h1>Ticket de compra: ${ticket._id}</h1>
                        <h2>Tu compra se generó exitosamente</h2>
                        <h2>¡Muchas gracias por tu compta!</h2>
                    `
                };

                let unprocessedProducts = false;

                if(productsSinStock.length !== 0) {
                    unprocessedProducts = true;
                }

                await transporter.sendMail(mailOptions);
                await client.messages.create({
                    body: `Su compra se realizó exitosamente: ${ticket._id} ¡Muchas gracias por tu compra!`,
                    from: TWILIO_SMS_NUMBER,
                    to: "+543517887437"
                })

                res.render("checkout", {isEmpty: false, ticketId: ticket._id, unprocessedProducts: unprocessedProducts, cartId: cart._id});
            } else {
                cart.products = productsSinStock;
                await cart.save();
                res.render("checkout", {isEmpty: true});
            }

        } catch (error) {
            res.status(500).send({ error: `Error al realizar la compra del carrito Controller: ${error.message}` });
        }
    }
}

export default cartController;