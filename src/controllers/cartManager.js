import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";

class cartManager {
    async addCart() {
        try {
            const newCart = new CartModel({ products: [] });
            await newCart.save();
            return newCart._id;
        } catch (error) {
            console.log("Error al agregar el nuevo carrito:", error);
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                console.error(`El producto con ID "${cartId}" no existe.`);
                return;
            };

            const product = await ProductModel.findById(productId);

            if (!product) {
                console.error(`El producto con ID "${productId}" no existe.`);
                return;
            }

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

            await cart.save();
            
            console.log(`Producto con ID "${productId}" agregado al carrito con ID ${cartId}`);
        } catch (error) {
            console.log("Error al agregar el producto al carrito", error);
        }
    }

    async getCartProducts(cartId) {
        try {
            const cart = await CartModel.findById(cartId).lean();

            if (!cart) {
                console.error(`El carrito con ID "${cartId}" no existe.`);
                return;
            }

            return cart.products;
        } catch (error) {
            console.error("Error al obtener los productos del carrito:", error);
        }
    };

    async updateProductsInCart(id, updatedProducts) {
        try {
            const cart = await CartModel.findById(id);

            if (!cart) {
                console.error(`El carrito con ID "${id}" no existe`);
                return null;
            };

            const formattedProducts = await Promise.all(updatedProducts.map(async (productIdData) => {
                const productId = productIdData.product;

                const product = await ProductModel.findById(productId);

                if (!product) {
                    console.error(`El producto con ID "${productId}" no existe en la base de datos`);
                    return null;
                }

                return {
                    product: product,
                    quantity: productIdData.quantity
                };
            }));

            const filteredProducts = formattedProducts.filter(product => product !== null);

            cart.products = filteredProducts;

            await cart.save();

            console.log("Productos del carrito actualizados correctamente");

            return cart;
        } catch (error) {
            console.error("Error al actualizar el producto del carrito", error)
        }
    }

    async updateAProductInCart(cartId, productId, newQuantity) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                console.error(`El carrito con ID "${id}" no existe`);
                return null;
            };

            const product = await ProductModel.findById(productId);

            if (!product) {
                console.error(`El producto con ID "${productId}" no existe.`);
                return;
            }

            const productInCart = cart.products.find(prod => prod.product._id.toString() === productId);

            if (productInCart) {
                productInCart.quantity = newQuantity;
            } else {
                console.error(`El producto de ID "${productId}" no se encuentra en el carrito`);
            }

            cart.markModified("products");

            await cart.save();
        }catch (error) {
            console.error("Error al cambiar la cantidad", error);
        }
        
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                console.error(`El carrito con ID "${cartId}" no existe`);
                return null;
            }

            const updatedProducts = cart.products.filter(
                (product) => product.product._id.toString() !== productId
            );

            cart.products = updatedProducts;

            await cart.save();

            console.log(`Producto de ID: "${productId}" eliminado del carrito de ID: "${cartId}"`);
            return cart;
        } catch (error) {
            console.error("Error al eliminar el producto del carrito", error);
        }
    }

    async deleteProductsCart(cartId) {
        try {
            const cart = await CartModel.findById(cartId);

            if (!cart) {
                console.error(`El carrito con ID "${cartId}" no existe`);
                return null;
            }

            cart.products = [];

            await cart.save();

            console.log("Carrito eliminado");

        } catch (error) {
            console.error("Error al eliminar el carrito", error)
        }
    }
}

export default cartManager;