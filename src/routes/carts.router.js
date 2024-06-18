import express from "express";
const router = express.Router();
import passport from "passport";
import CartController from "../controllers/cartController.js";
const cartController = new CartController();

router.get("/carts/:cid", cartController.getCartProducts);
router.post("/carts/:cid/purchase", passport.authenticate('jwt', { session: false }), cartController.purchaseCart);
router.post("/carts", cartController.addCart);
router.post("/carts/:cid/product/:pid", cartController.addProductToCart);
router.put("/carts/:cid", cartController.updateProductsInCart);
router.put("/carts/:cid/product/:pid", cartController.updateAProductInCart);
router.delete("/carts/:cid/product/:pid", cartController.deleteProductFromCart)
router.delete("/carts/:cid", cartController.deleteProductsCart);

export default router;