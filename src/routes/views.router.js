import express from "express";
import { Router } from "express";
import ProductModel from "../models/product.model.js";
import passport from "passport";
const router = Router();
import services from "../services/index.js";

function checkAuthenticated(req, res, next) {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (user) {
            return res.redirect('/products');
        }
        next();
    })(req, res, next);
}


router.get("/", checkAuthenticated, (req,res) => {
    res.render("login");
});

router.get("/products", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
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
            user: req.user
        });

    }catch (error){
        res.status(500).json({error: "Error interno del servidor"});
    }
});

router.get("/chat", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), (req, res) => {
    res.render("chat");
})

router.get("/realtimeproducts", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), (req, res) => {
    res.render("realtimeproducts");
});

router.get("/products/:pid", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
    const productId = req.params.pid;
    try{
        const product = await services.productService.getProductById(productId);

        if(!product){
            return res.status(404).send("Producto no encontrado");
        }

        res.render('product', { product });
    }catch (error){
        console.error("Error al obtener el producto", error);
        res.status(500).send("Error interno del servidor");
    }
});

router.get("/carts/:cid", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), async (req, res) => {
    const cartId = req.params.cid;
    try{
        const cart = await services.cartService.getCartProducts(cartId);

        if(!cart){
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("cart", {cart});

    }catch (error){
        console.error("Error al obtener el carrito", error);
        res.status(500).send("Error interno del servidor")
    }
});

router.get("/login", checkAuthenticated, (req, res) => {
    res.render("login");
});

router.get("/register", checkAuthenticated, async (req, res) => {
    res.render("register");
});

router.get("/profile", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), (req, res) => {
    res.render("profile", {user: req.user});
})

router.get("/admin", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), (req, res) => {
    const isAdmin = req.user.role === "admin";
    res.render("admin", {isAdmin});
})

export default router;