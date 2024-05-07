import express from "express";
import ProductManager from "../controllers/productManager.js";
const router = express.Router();
const bookManager = new ProductManager;

router.get("/products", async (req, res) => {
    try{
        const books = await bookManager.getProducts();

        let limit = parseInt(req.query.limit);

        if(limit){
            let selectedBook = books.slice(0, limit);
            res.send(selectedBook);
        }else{
            res.send(books);
        }
    }catch (error) {
        console.log("Error al obtener los libros:", error);
        res.send("Error al obtener los libros");
    }
});

router.get("/products/:pid", async (req, res) => {
    try{
        let id = req.params.pid;

        const selectedBook = await bookManager.getProductById(id)

        if(selectedBook) {
            res.send(selectedBook);
        }else {
            res.send({ error: "Producto no encontrado" });
        }

    }catch (error) {
        console.log(error);
        res.send("Error al obtener el libro requerido");
    }
});

router.post("/products", async (req, res) => {
    try {
        const { title, description, code, price, img, stock, category } = req.body;

        if (!title || !description || !code || !price || !img || !stock || !category) {
            return res.status(400).send({ error: "Todos los campos del producto son obligatorios" });
        }

        const books = await bookManager.getProducts();
        const existedCode = books.find(prod => prod.code === code);

        if (existedCode){
            return res.status(400).send({ error: "El campo code ya está asignado a otro producto" })
        }

        await bookManager.addProduct(title, description, code, price, img, true, stock, category);

        res.status(200).send({ message: "Producto agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar el producto:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.put("/products/:pid", async (req, res) => {
    try {
        const id = req.params.pid;
        const updateFields = req.body;

        let hasFieldsToUpdate = false;
        for (const field in updateFields) {
            hasFieldsToUpdate = true;
            break;
        }

        if (!hasFieldsToUpdate) {
            return res.status(400).send({ error: "Se requieren campos a actualizar en el cuerpo de la solicitud." });
        }

        await bookManager.updateProduct(id, updateFields);
        res.status(200).send({ message: `Producto con ID ${id} actualizado correctamente` });
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.delete("/products/:pid", async (req, res) => {
    let id = req.params.pid;
    await bookManager.deleteProduct(id);
    res.status(200).send({ message: "Producto eliminado correctamente" });
});

export default router;