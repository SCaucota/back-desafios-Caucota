import services from "../services/index.js";

class ProductManager {

    addProduct = async (req, res) => {
        try {
            const {title, description, code, price, img, status, stock, category} = req.body;

            if (!title || !description || !code || !price || !img || !status || stock === undefined || !category) {
                console.error("Todos los campos del producto son obligatorios");
                return;
            };

            const repeatedCode = await services.productService.getProductByCode(code);

            if (repeatedCode) {
                console.error(`El código (code) del producto ${title} ya está en uso`);
                return;
            };
            
            const newProduct = await services.productService.addProduct({ title, description, code, price, img, status, stock, category});

            res.json(newProduct);
        } catch (error) {
            res.status(500).json({ error: "Error al agregar el producto" });
        }
    }

    getProducts = async (req, res) => {
        try {
            const products = await services.productService.getProducts();
            let limit = parseInt(req.query.limit);

            if (products.length === 0) {
                console.log("No hay productos disponibles.");
            } else if(limit){
                let selectedProduct = products.slice(0, limit);
                res.send(selectedProduct);
            }else{
                res.send(products);
            }
        } catch (error) {
            res.status(500).json({ error: "Error al obtener los productos" });
        }
    }

    getProductById = async (req, res) => {
        try {
            const id = req.params.pid;
            const product = await services.productService.getProductById(id);

            if (!product) {
                console.error(`El producto de id "${id}" no existe`);
                return null;
            }

            res.send(product);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener el producto" });
        }
    }

    updateProduct = async (req, res) => {
        try {
            const fields = req.body;
            const id = req.params.pid;
            const updateProduct = await services.productService.updateProduct(id, fields);
            

            if (updateProduct === -1) {
                console.error(`El producto de id "${id}" no existe`);
                return;
            }

            res.status(200).json({ message: "El producto se actualizo correctamente" });
        } catch (error) {
            res.status(500).json({ error: "Error al actualizar el producto" });
        }
    }

    deleteProduct = async (req, res) => {
        try {
            const id = req.params.pid
            const deleteProduct = await services.productService.deleteProduct(id);

            if (!deleteProduct) {
                console.log(`El producto de id "${id}" no existe`);
                return null;
            }

            res.status(200).json({ message: "El producto se elimino correctamente" });
        }catch (error) {
            res.status(500).json({ error: "Error al intentar eliminar el producto" });
        }
        
    }
}

export default ProductManager;