import express from "express";
const router = express.Router();
import passport from "passport";
import ProductController from "../controllers/productController.js";
import upload from "../middleware/multer.js";
const productController = new ProductController();

router.get("/", productController.getProducts);
router.get("/:pid", productController.getProductById);
router.post("/", upload.single('img'), passport.authenticate('jwt', { session: false }), productController.addProduct);
router.put("/:pid", productController.updateProduct);
router.delete("/:pid", passport.authenticate('jwt', { session: false }), productController.deleteProduct);

export default router;