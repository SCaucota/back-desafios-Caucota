import services from "../services/index.js";

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
        try {
            const cartId = req.params.cid;
            const { cart, productsSinStock } = await services.cartService.purchaseCart(cartId);

            if (productsSinStock.length === 0) {
                const userEmail = req.user.email;
                const amount = cart.products.reduce((total, productItem) => {
                    if (productItem.product.price) {
                        return total + (productItem.quantity * productItem.product.price);
                    }
                    return total;
                }, 0);

                function generateCode(length, chars) {
                    let code = [];
                    for (var i = 0; i < length; i++) {
                        let index = Math.floor(Math.random() * chars.length);
                        code.push(chars[index]);
                    }
                    return code.join('');
                }

                const ticketCode = generateCode(10, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
                const ticketData = {
                    code: ticketCode,
                    purchase_datetime: Date.now(),
                    amount,
                    purchaser: userEmail
                };
                await services.ticketService.generateTicket(ticketData);

                res.status(200).json({ message: "La compra del carrito fue exitosa" });
            } else {
                res.status(200).json({ productsSinStock: productsSinStock.map(item => item.product.id) });
            }
        } catch (error) {
            res.status(500).send({ error: `Error al realizar la compra del carrito Controller: ${error.message}` });
        }
    }
}

export default cartController;