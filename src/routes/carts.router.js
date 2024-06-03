import express from "express";
const router = express.Router();
import CartManager from "../controllers/cartManager.js";
const cartManager = new CartManager;

router.get("/carts/:cid", cartManager.getCartProducts);
router.post("/carts", cartManager.addCart);
router.post("/carts/:cid/product/:pid", cartManager.addProductToCart);
router.put("/carts/:cid", cartManager.updateProductsInCart);
router.put("/carts/:cid/product/:pid", cartManager.updateAProductInCart);
router.delete("/carts/:cid/product/:pid", cartManager.deleteProductFromCart)
router.delete("/carts/:cid", cartManager.deleteProductsCart);

export default router;