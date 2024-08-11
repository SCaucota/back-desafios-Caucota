import express from "express";
import { Router } from "express";
import ProductModel from "../models/product.model.js";
import { generateProducts } from "../utils/mock.products.js";
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

function verifyRol (roles) {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next();
        }
        if (req.user.role === 'admin') {
            return res.status(401).redirect('/realtimeproducts');
        }
        return res.status(403).send('Acceso denegado');
    }
}

router.get("/", checkAuthenticated, (req,res) => {
    res.render("login");
});

router.get("/products", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), verifyRol(["user", "premium"]),async (req, res) => {
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

        query.owner = { $ne: req.user.email };

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
            user: req.user,
            premium: req.user.role === "premium"
        });

    }catch (error){
        res.status(500).json({error: "Error interno del servidor"});
    }
});

router.get("/chat", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), verifyRol(["user", "premium"]),(req, res) => {
    res.render("chat");
})

router.get("/realtimeproducts", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), verifyRol(["admin", "premium"]),(req, res) => {
    res.render("realtimeproducts");
});

router.get("/adminUsers", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), verifyRol(["admin"]), async (req, res) => {
    try{
        const users = await services.userService.getAllUsers();

        res.render("adminUsers", {users: users});
    }catch (error) {
        res.status(500).send("Error interno del servidor");
    }
})

router.get("/products/:pid", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), verifyRol(["user", "premium"]), async (req, res) => {
    const productId = req.params.pid;
    const cartId = req.user.cart._id;
    try{
        const product = await services.productService.getProductById(productId);

        if(!product){
            return res.status(404).send("Producto no encontrado");
        }

        const cart = req.user.cart

        const quantity = cart.products.find(product => product.product.toString() === productId)?.quantity || 0;

        res.render('product', { product: product, cartId: cartId, quantity: quantity });
    }catch (error){
        req.logger.error("Error al obtener el producto", error);
        res.status(500).send("Error interno del servidor");
    }
});

router.get("/carts/:cid", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), verifyRol(["user", "premium"]), async (req, res) => {
    const cartId = req.params.cid;
    const userCartId = req.user.cart._id
    
    try{
        const cart = await services.cartService.getCartProducts(cartId);

        if(!cart){
            return res.render("404");
        }
        
        if(cartId.toString() !== userCartId.toString()){
            return res.render("404")
        }else{
            res.render("cart", {cart: cart, cartId: cartId});
        }

    }catch (error){
        req.logger.error("Error al obtener el carrito", error);
        res.status(500).send("Error interno del servidor")
    }
});

router.get("/carts/:cid/purchase", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), verifyRol(["user", "premium"]),async (req, res) => {
    const cartId = req.params.cid;
    try{
        const cart = await services.cartService.getCartProducts(cartId);

        if(!cart){
            return res.status(404).send("Carrito no encontrado");
        }

        res.render("checkout");
    }
    catch (error) {
        res.status(500).send("Error interno del servidor");
    }
})

router.get("/login", checkAuthenticated, (req, res) => {
    res.render("login");
});

router.get("/register", checkAuthenticated, async (req, res) => {
    res.render("register");
});

router.get("/profile", passport.authenticate("jwt", { session: false, failureRedirect: "/login" }), (req, res) => {
    res.render("profile", {user: req.user, premium: req.user.role === "premium"});
})

router.get("/mockingproducts", (req, res) => {
    const products = [];
    for (let i = 0; i < 100; i++) {
        products.push(generateProducts());
    };
    res.send(products);
})


router.get("/loggerTest", (req, res) => {
    req.logger.http("Mensaje HTTP");
    req.logger.fatal("Mensaje FATAL");
    req.logger.error("Mensaje ERROR");
    req.logger.warning("Mensaje WARNING");
    req.logger.info("Mensaje INFO");
    req.logger.debug("Mensaje DEBUG");

    res.send("Logs generados")
})

router.get("/resetpassword", (req, res) => {
    res.render("resetpassword");
})

router.get("/changepassword", (req, res) => {
    res.render("changepassword");
})

router.get("/confirmacionEnvio", (req, res) => {
    res.render("confirmacionEnvio");
})

export default router;