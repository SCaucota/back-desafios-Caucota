import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";

class CartRepository {
    async addCart() {
        try {
            const newCart = new CartModel({ products: [] });
            return await newCart.save();
        } catch (error) {
            throw new Error("Error al agregar el nuevo carrito:", error);
        }
    }
}

export default CartRepository;