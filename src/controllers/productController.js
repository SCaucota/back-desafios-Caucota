import services from "../services/index.js";
import CustomError from "../services/errors/customError.js";
import { EErrors } from "../services/errors/enum.js";
import {generateInfoErrorProduct} from "../services/errors/info.js";
import EmailManager from "../services/email.js";

const emailManager = new EmailManager();

class ProductController {

    addProduct = async (req, res, next) => {
        try {
            const {title, description, code, price, img, status, stock, category} = req.body;

            const parsedPrice = parseFloat(price);
            const parsedStock = parseInt(stock, 10);

            if (!title || !description || !code || !price || !img || !status || !stock || !category) {
                throw CustomError.createError({
                    name: "Producto nuevo",
                    cause: generateInfoErrorProduct({title, description, code, price, img, status, stock, category}),
                    menssage: "Error al crear el producto",
                    code: EErrors.PROUDUCT_VALIDATION_ERROR
                });
            }

            const repeatedCode = await services.productService.getProductByCode(code);

            if (repeatedCode) {
                throw CustomError.createError({
                    name: "Código duplicado",
                    cause: `El código (code) del producto ${title} ya está en uso`,
                    message: "Código de producto duplicado",
                    code: EErrors.PRODUCT_ALREADY_EXIST
                })
            };

            const newProduct = await services.productService.addProduct({title, description, code, price: parsedPrice, img, status, stock: parsedStock, category});

            res.json(newProduct);
        } catch (error) {
            next(error);
        }
    }

    getProducts = async (req, res) => {
        try {
            const products = await services.productService.getProducts();
            
            let limit = parseInt(req.query.limit);

            if (products.length === 0) {
                req.logger.error("No hay productos disponibles.");
            } else if(limit){
                let selectedProduct = products.slice(0, limit);
                res.send(selectedProduct);
            }else{
                res.send(products);
            }
        } catch (error) {
            req.logger.error("Error al obtener los productos", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    getProductById = async (req, res, next) => {
        try {
            const id = req.params.pid;
            const product = await services.productService.getProductById(id);

            if (!product) {
                throw CustomError.createError({
                    name: "Producto no encontrado",
                    cause: `El producto de id "${id}" no existe`,
                    message: "Producto no encontrado",
                    code: EErrors.PRODUCT_NOT_FOUND
                })
            }

            res.json(product);
        } catch (error) {
            next(error);
        }
    }

    updateProduct = async (req, res) => {
        try {
            const fields = req.body;
            const id = req.params.pid;
            const updateProduct = await services.productService.updateProduct(id, fields);
            

            if (updateProduct === -1) {
                req.logger.error(`El producto de id "${id}" no existe`);
                return;
            }

            req.logger.info(`Producto con ID "${id}" actualizado correctamente`);
            res.status(200).json(updateProduct);
        } catch (error) {
            req.logger.error("Error al actualizar el Producto", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    deleteProduct = async (req, res) => {
        try {
            const id = req.params.pid
            const user = req.user

            const product = await services.productService.getProductById(id);

            if(user.role === "admin" && product.owner !== "admin") {
                await emailManager.sendEmailPremiumProductDeleted(product.owner, product.title);
            }
            
            await services.productService.deleteProduct(id);

            req.logger.info(`Producto con ID "${id}" eliminado correctamente`);
            res.status(200).send({ message: "Se elimino el producto exitosamente" });
        }catch (error) {
            req.logger.error("Error al actualizar el producto", error);
            res.status(500).json({ error: "Error al intentar eliminar el producto" });
        }
    }
}

export default ProductController;