import express from "express";
import { Router } from "express";
import ProductManager from "../controllers/productManager.js";
import CartManager from "../controllers/cartManager.js";
import ProductModel from "../models/product.model.js";
const router = Router();
const productManager = new ProductManager;
const cartManager = new CartManager;


router.get("/", async (req,res) => {
    res.render("home");
})

router.get("/products", async (req, res) => {
    try{

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;

        const query = {};

        if(req.query.type) {
            query.category = req.query.type;
        }

        let sortOptions = {};
        if(req.query.sort && (req.query.sort === "asc" || req.query.sort === "desc")) {
            sortOptions.price = req.query.sort;
        }

        const books = await ProductModel.paginate(query, {limit, page, sort: sortOptions});

        const librosResultadoFinal = books.docs.map(book => {
            const {_id, ...rest} = book.toObject();
            return {_id, ...rest};
        })

        res.render("products", {
            status: "success",
            payload: librosResultadoFinal,
            totalPages: books.totalPages,
            prevPage: books.prevPage,
            nextPage: books.nextPage,
            page: books.page,
            hasPrevPage: books.prevPage ? true : false,
            hasNextPage: books.nextPage ? true : false,
            prevLink: books.hasPrevPage ? `/products?page=${books.prevPage}&limit=${limit}&sort=${req.query.sort || ''}&type=${req.query.type || ''}` : null,
            nextLink: books.hasNextPage ? `/products?page=${books.nextPage}&limit=${limit}&sort=${req.query.sort || ''}&type=${req.query.type || ''}` : null,
            user: req.session.user
        });

    }catch (error){
        res.status(500).json({error: "Error interno del servidor"});
    }
});

router.get("/chat", async (req, res) => {
    res.render("chat");
})

router.get("/realtimeproducts", async (req, res) => {
    res.render("realtimeproducts");
});

router.get("/products/:id", async (req, res) => {
    const productId = req.params.id;
    try{
        const product = await productManager.getProductById(productId);

        if(!product){
            return res.status(404).send("Producto no encontrado");
        }

        res.render('product', { product });
    }catch (error){
        console.error("Error al obtener el producto", error);
        res.status(500).send("Error interno del servidor");
    }
});

router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
    try{
        const cart = await cartManager.getCartProducts(cartId);

        if(!cart){
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cart", {cart});

    }catch (error){
        console.error("Error al obtener el carrito", error);
        res.status(500).send("Error interno del servidor")
    }
});

router.get("/login", async (req, res) => {
    if(req.session.login) {
        return res.redirect("/products");
    }
    res.render("login");
});

router.get("/register", async (req, res) => {
    if(req.session.login) {
        return res.redirect("/profile");
    }
    res.render("register");
});

router.get("/profile", async (req, res) => {
    if(!req.session.login) {
        return res.redirect("/login");
    };

    res.render("profile", {user: req.session.user});
})

export default router;