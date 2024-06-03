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

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error(`Carrito con ID "${cartId}" no encontrado`);

            const product = await ProductModel.findById(productId);
            if (!product) throw new Error(`Producto con ID "${productId}" no encontrado`);

            const existingProduct = cart.products.find(prod => prod.product._id.toString() === productId);

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({
                    product: product,
                    quantity: quantity
                });
            }

            cart.markModified("products");

            return await cart.save();
        } catch (error) {
            throw new Error("Error al agregar el nuevo producto:", error);
        }
    }

    async getCartProducts(cartId) {
        try {
            const cart = await CartModel.findById(cartId).lean();
            if (!cart) throw new Error(`Carrito con ID "${cartId}" no encontrado`);
            return cart.products;
        } catch (error) {
            throw new Error("Error al obtener los Productos:", error);
        }
    }

    async updateProductsInCart(id, updatedProducts){
        try {
            const cart = await CartModel.findById(id);
            if (!cart) throw new Error(`Carrito con ID "${id}" no encontrado`);

            const formattedProducts = await Promise.all(updatedProducts.map(async (productData) => {
                const product = await ProductModel.findById(productData.product);
                if (!product) throw new Error(`Producto con ID "${productData.product}" no encontrado`);

                return { product, quantity: productData.quantity };
            }));

            cart.products = formattedProducts;
            return await cart.save();
        } catch (error) {
            throw new Error("Error al actualizar los productos del carrito:", error);
        }
    }

    async updateAProductInCart(cartId, productId, quantity) {
        try {
            const cart = await CartModel.findById(cartId);
            if(!cart) throw new Error(`Producto con ID "${productId}" no encontrado en el carrito`);

            const productInCart = cart.products.find(prod => prod.product._id.toString() === productId);
            if (!productInCart) throw new Error(`Producto con ID "${productId}" no encontrado en el carrito`);

            if (productInCart) {
                productInCart.quantity = newQuantity;
            } else {
                console.error(`El producto de ID "${productId}" no se encuentra en el carrito`);
            }

            cart.markModified("products");

            return await cart.save();
        } catch (error) {
            throw new Error("Error al cambiar la cantidad del producto:", error);
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error(`Carrito con ID "${cartId}" no encontrado`);

            const updatedProducts = cart.products.filter(
                (product) => product.product._id.toString() !== productId
            );

            cart.products = updatedProducts;

            return await cart.save();
        } catch (error) {
            throw new Error("Error al eliminar el producto del carrito:", error);
        }
    }

    async deleteProductsCart(cartId) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error(`Carrito con ID "${cartId}" no encontrado`);

            cart.products = [];

            return await cart.save();
        } catch (error) {
            throw new Error("Error al eliminar los productos del carrito:", error);
        }
    }
}

export default CartRepository;