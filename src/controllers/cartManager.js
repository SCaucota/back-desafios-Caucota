import services from "../services/index.js";

class cartManager {
    addCart = async (req, res) => {
        try {
            const newCart = await services.cartService.addCart();
            res.json(newCart);
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

            res.status(200).send({ message: "Producto agregado correctamente"});
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
            const quantity = req.body;
            
            const cart = await services.cartService.updateAProductInCart(cartId, productId, quantity);

            if (!cart) {
                console.error(`El carrito con ID "${id}" no existe`);
                return null;
            };

            res.json(cart);
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

            res.json(cart);
        } catch (error) {
            res.status(500).send({ error: "Error al eliminar el producto del carrito" });
        }
    }

    deleteProductsCart = async (req, res) => {
        try {
            const id = req.params.cid

            const cart = await services.cartService.deleteProductsCart(id);

            if (!cart) {
                console.error(`El carrito con ID "${cartId}" no existe`);
                return null;
            }

            res.status(200).json({ messsage: "Carrito eliminado exitosamente" });
        } catch (error) {
            res.status(500).send({ error: "Error al eliminar los productos del carrito" });
        }
    }
}

export default cartManager;