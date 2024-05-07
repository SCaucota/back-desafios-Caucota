import express from "express";
import CartManager from "../controllers/cartManager.js";
import ProductManager from "../controllers/productManager.js";
const router = express.Router();
const cartManager = new CartManager;
const productManager = new ProductManager;

router.get("/carts/:cid", async (req, res) => {
    try {
        let id = req.params.cid

        const selectedCart = await cartManager.getCartProducts(id)

        if (selectedCart) {
            res.send(selectedCart);
            console.log(selectedCart)
        } else {
            res.status(404).send({ error: `El carrito de ID ${id} no existe` });;
        }

    } catch (error) {
        console.log(error);
        res.send("Error al obtener el carrito requerido");
    }
});

router.post("/carts", async (req, res) => {
    try {

        await cartManager.addCart();

        res.status(200).send({ message: "Carrito creado correctamente" });
    } catch (error) {
        console.error("Error al crear el carrito:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.post("/carts/:cid/product/:pid", async (req, res) => {
    try {
        let productId = req.params.pid;
        let cartId = req.params.cid;

        const product = await productManager.getProductById(productId);
        if (!product) {
            return res.status(404).send({ error: `El producto con ID ${productId} no existe` });
        }

        await cartManager.addProductToCart(cartId, productId);
        res.status(200).send({ message: "Producto agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.put("/carts/:cid", async (req, res) => {
    try {
        const id = req.params.cid;
        const updatedProducts = req.body;

        if (!updatedProducts) {
            return res.status(400).send({ error: "El formato de los productos es inválido" });
        }

        const updatedCart = await cartManager.updateProductsInCart(id, updatedProducts);

        if (!updatedCart) {
            return res.status(404).send({ error: `El carito con ID ${id} no existe` })
        }

        res.status(200).send({ message: "Produtos del carrito actualizados correctamente" });

    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.put("/carts/:cid/product/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const cartId = req.params.cid;
        const newQuantity = req.body.quantity;
        await cartManager.updateAProductInCart(cartId, productId, newQuantity);
        res.status(200).send({ message: `Cantidad del producto de ID "${productId}" modificada` });
    }catch (error) {
        res.status(500).send({ error: "Error interno del servidor" })
    }

})

router.delete("/carts/:cid/product/:pid", async (req, res) => {
    try {
        let productId = req.params.pid;
        let cart = req.params.cid;
        await cartManager.deleteProductFromCart(cart, productId);
        res.status(200).send({ message: "Producto eliminado correctamente del carrito" });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }

})

router.delete("/carts/:cid", async (req, res) => {
    try {
        let id = req.params.cid;
        await cartManager.deleteProductsCart(id);
        res.status(200).send({ message: "El carrito se vació correctamente" });
    } catch (error) {
        res.status(500).send({ error: "Erorr interno del servidor" });
    }
})

export default router;
