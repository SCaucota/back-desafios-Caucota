import ProductModel from "../models/product.model.js";

class ProductManager {

    addProduct = async (title, description, code, price, img, status, stock, category) => {

        try {
            if (!title ||
                !description ||
                !code ||
                !price ||
                !img ||
                !status ||
                stock === undefined ||
                !category
            ) {
                console.error("Todos los campos del producto son obligatorios");
                return;
            };

            const repeatedCode = await ProductModel.findOne({ code: code });

            if (repeatedCode) {
                console.error(`El código (code) del producto ${title} ya está en uso`);
                return;
            };

            const newProduct = new ProductModel({
                title,
                description,
                code,
                price,
                img,
                status,
                stock,
                category
            });

            await newProduct.save();
        } catch (error) {
            console.log("Error al agregar el producto", error);
        }
    }

    getProducts = async () => {
        try {
            const products = await ProductModel.find().lean();

            if (products.length === 0) {
                console.log("No hay productos disponibles.");
            } else {
                return products;
            }
        } catch (error) {
            console.log("Error al recuperar los productos", error);
            throw error;
        }
    }

    getProductById = async (id) => {
        try {
            const product = await ProductModel.findById(id).lean();

            if (!product) {
                console.error(`El producto de id "${id}" no existe`);
                return null;
            }

            return product;
        } catch (error) {
            console.log("No se pudo enconrar el producto requerido", error);
        }
    }

    updateProduct = async (id, fields) => {
        try {

            const updateProduct = await ProductModel.findByIdAndUpdate(id, fields);

            if (updateProduct === -1) {
                console.error(`El producto de id "${id}" no existe`);
                return;
            }

            for (const field in fields) {
                if (field !== "id" && fields[field] !== undefined) {
                    products[productIndex][field] = fields[field];
                }
            };
            
            console.log(`Producto con ID "${id}" actualizado correctamente`);
            return updateProduct;
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
        }
    }

    deleteProduct = async (id) => {
        try {
            const deleteProduct = await ProductModel.findByIdAndDelete(id);

            if (!deleteProduct) {

                console.log(`El producto de id "${id}" no existe`);
                return null;
            }

            console.log("Producto eliminado")
        }catch (error) {
            console.error("Error al eliminar el producto:", error);
        }
        
    }
}

export default ProductManager;