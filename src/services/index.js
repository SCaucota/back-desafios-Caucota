import ProductRepository from "../repositories/products.repository.js";
import CartRepository from "../repositories/carts.repository.js";
const productService = new ProductRepository();
const cartService = new CartRepository();

export default {
    productService: productService,
    cartService: cartService
}