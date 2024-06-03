import productService from "../services/index.js";

class ProductManager {

    addProduct = async (req, res) => {
        try {
            const {title, description, code, price, img, status, stock, category} = req.body;

            if (!title || !description || !code || !price || !img || !status || stock === undefined || !category) {
                console.error("Todos los campos del producto son obligatorios");
                return;
            };

            const repeatedCode = await productService.getProductByCode(code);

            if (repeatedCode) {
                console.error(`El código (code) del producto ${title} ya está en uso`);
                return;
            };

            const newProduct = await productService.addProduct({ title, description, code, price, img, status, stock, category});

            res.json(newProduct);
        } catch (error) {
            res.status(500).json({ error: "Error al agregar el producto" });
        }
    }

    getProducts = async (req, res) => {
        try {
            const products = await productService.getProducts();
            let limit = parseInt(req.query.limit);

            if (products.length === 0) {
                console.log("No hay productos disponibles.");
            } else if(limit){
                let selectedProduct = products.slice(0, limit);
                res.send(selectedProduct);
            }else{
                return products;
            }
        } catch (error) {
            res.status(500).json({ error: "Error al obtener los productos" });
        }
    }

    getProductById = async (req, res) => {
        try {
            const id = req.params.pid;

            if (!id) {
                console.error(`El ID del producto es obligatorio ${id}`);
                return res.status(400).json({ error: "El ID del producto es obligatorio" });
            }

            const product = await productService.getProductById(id);

            if (!product) {
                console.error(`El producto de id "${id}" no existe`);
                return null;
            }

            return product;
        } catch (error) {
            res.status(500).json({ error: "Error al obtener el producto" });
        }
    }

    updateProduct = async (req, res) => {
        try {
            const updateProduct = await productService.updateProduct(req.params._id, req.body);
            const fields = req.body;

            if (updateProduct === -1) {
                console.error(`El producto de id "${updateProduct._id}" no existe`);
                return;
            }

            for (const field in fields) {
                if (field !== "id" && fields[field] !== undefined) {
                    products[productIndex][field] = fields[field];
                }
            };
            
            console.log(`Producto con ID "${updateProduct._id}" actualizado correctamente`);
            return updateProduct;
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar el producto" });
        }
    }

    deleteProduct = async (req, res) => {
        try {
            const deleteProduct = await productService.deleteProduct(req.params._id);

            if (!deleteProduct) {
                console.log(`El producto de id "${deleteProduct._id}" no existe`);
                return null;
            }

            console.log("Producto eliminado")
        }catch (error) {
            res.status(500).json({ error: "Error al intentar eliminar el producto" });
        }
        
    }
}

export default ProductManager;