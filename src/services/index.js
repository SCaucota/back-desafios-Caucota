import ProductRepository from "../repositories/products.repository.js";
import CartRepository from "../repositories/carts.repository.js";
import UserRepository from "../repositories/users.repository.js";
const productService = new ProductRepository();
const cartService = new CartRepository();
const userRepository = new UserRepository();

export default {
    productService: productService,
    cartService: cartService,
    userRepository: userRepository
}