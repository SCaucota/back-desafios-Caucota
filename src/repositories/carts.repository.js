import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";
import TicketModel from "../models/ticket.model.js";

import CustomError from "../services/errors/customError.js";
import { EErrors } from "../services/errors/enum.js";

class CartRepository {
    async addCart() {
        try {
            const newCart = new CartModel({ products: [] });
            return await newCart.save();
        } catch (error) {
            throw new Error("Error al agregar el nuevo carrito:", error);
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error(`Carrito con ID "${cartId}" no encontrado`);

            const product = await ProductModel.findById(productId);
            if (!product) throw new Error(`Producto con ID "${productId}" no encontrado`);

            const existingProduct = cart.products.find(prod => prod.product.id === productId);

            if (existingProduct) {
                existingProduct.quantity = quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            cart.markModified("products");

            return await cart.save();
        } catch (error) {
            throw error;
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

    async updateProductsInCart(id, updatedProducts) {
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
            if (!cart) throw new Error(`Producto con ID "${productId}" no encontrado en el carrito`);

            const productInCart = cart.products.find(prod => prod.product.id.toString() === productId);
            if (!productInCart) throw new Error(`Producto con ID "${productId}" no encontrado en el carrito`);

            productInCart.quantity = quantity;

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
                (product) => product.product.id.toString() !== productId
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

    async deleteCart(cartId) {
        try {
            await CartModel.findByIdAndDelete(cartId);
            return true;
        } catch (error) {
            throw new Error("Error al eliminar el carrito:", error);
        }
    }

    async purchaseCart(cartId, userEmail) {
        try {
            const cart = await CartModel.findById(cartId);
            if (!cart) throw new Error(`Carrito con ID "${cartId}" no encontrado`);

            const productsSinStock = [];

            for (const productItem of cart.products) {
                const product = await ProductModel.findById(productItem.product._id);

                if (productItem.quantity > product.stock) {
                    productsSinStock.push(productItem);
                } else {
                    product.stock -= productItem.quantity;
                    await product.save();
                }
            }

            cart.products = cart.products.filter(productItem => !productsSinStock.includes(productItem));
            await cart.save();

            if (cart.products.length !== 0) {

                function generateCode(length, chars) {
                    let code = [];
                    for (var i = 0; i < length; i++) {
                        let index = Math.floor(Math.random() * chars.length);
                        code.push(chars[index]);
                    }
                    return code.join('');
                }

                const amount = cart.products.reduce((total, productItem) => {
                    if (productItem.product.price) {
                        return total + (productItem.quantity * productItem.product.price);
                    }
                    return total;
                }, 0);

                
                const ticketCode = generateCode(10, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
                const ticketData = {
                    code: ticketCode,
                    purchase_datetime: Date.now(),
                    amount,
                    purchaser: userEmail
                };

                let unprocessedProducts = false;

                if(productsSinStock.length !== 0) {
                    unprocessedProducts = true;
                }

                cart.products = productsSinStock;
                await cart.save();

                return { ticketData, unprocessedProducts };
                
            } else {
                cart.products = productsSinStock;
                await cart.save();
                return { isEmpty: true };
            }

        } catch (error) {
            throw new Error(`Error al finalizar la compra: ${error.message}`);
        }
    }
}

export default CartRepository;