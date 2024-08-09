import express from "express";
const router = express.Router();
import passport from "passport";
import CartController from "../controllers/cartController.js";
const cartController = new CartController();

router.get("/:cid", cartController.getCartProducts);
router.post("/:cid/purchase", passport.authenticate('jwt', { session: false }), cartController.purchaseCart);
router.post("/", cartController.addCart);
router.post("/:cid/product/:pid", cartController.addProductToCart);
router.put("/:cid", cartController.updateProductsInCart);
router.put("/:cid/product/:pid", cartController.updateAProductInCart);
router.delete("/:cid/product/:pid", cartController.deleteProductFromCart)
router.delete("/:cid", cartController.deleteProductsCart);

export default router;