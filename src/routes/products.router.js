import express from "express";
const router = express.Router();
import ProductManager from "../controllers/productManager.js";
const productManager = new ProductManager();

router.get("/products", productManager.getProducts);
router.get("/products/:pid", productManager.getProductById);
router.post("/products", productManager.addProduct);
router.put("/products/:pid", productManager.updateProduct);
router.delete("/products/:pid", productManager.deleteProduct);

export default router;