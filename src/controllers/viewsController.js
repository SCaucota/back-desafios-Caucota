import express from "express";
import ProductModel from "../models/product.model.js";
import services from "../services/index.js";
import { generateProducts } from "../utils/mock.products.js";

class ViewsController {
    checkAuthenticated = async (req, res, next) => {
        res.render("login");
    }

    renderProducts = async (req, res) => {
        try {

            const page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 10;

            const query = {};

            if (req.query.type) {
                query.category = req.query.type;
            }

            if(req.query.search) {
                query.title = { $regex: req.query.search, $options: "i" };
            }

            let sortOptions = {};
            if (req.query.sort && (req.query.sort === "asc" || req.query.sort === "desc")) {
                sortOptions.price = req.query.sort;
            }

            query.owner = { $ne: req.user.email };

            const books = await ProductModel.paginate(query, { limit, page, sort: sortOptions });
            

            const librosResultadoFinal = books.docs.map(book => {
                const { _id, img, ...rest } = book.toObject();
                return {
                    _id,
                    img,
                    ...rest,
                    noImage: img === "Sin imagen"
                };
            });


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
                noAdmin: req.user.role !== "admin",
                userPremium: req.user.role === "premium"
            });

        } catch (error) {
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    renderChat = async (req, res) => {
        res.render("chat", {chatActive: true, noAdmin: req.user.role !== "admin", userPremium: req.user.role === "premium"});
    };

    renderRealTimeProducts = async (req, res) => {
        res.render("realtimeproducts", {
            userPremium: req.user.role === "premium", 
            active: true, 
            user: req.user, 
            noAdmin: req.user.role !== "admin",
            isAdmin: req.user.role === "admin"
        });
    }

    renderUsers = async (req, res) => {
        try {
            const users = await services.userService.getAllUsers();

            const actualDate = new Date();

            const twoDaysAgo = new Date(actualDate);
            twoDaysAgo.setDate(actualDate.getDate() - 2)

            let usersInactive = [];

            const updatedUsers = users.map(user => {
                const lastConnection = new Date(user.last_connection);
                const isInactive = lastConnection <= twoDaysAgo
                if (isInactive) {
                    const inactiveUser = { ...user, isInactive: true }
                    usersInactive.push(inactiveUser)
                    return inactiveUser
                } else {
                    return user
                }
            });

            res.render("adminUsers", {
                users: updatedUsers,
                inactiveUsers: usersInactive.length,
                usersToDelete: usersInactive.length === 0 ? true : false,
                viewUsersActive: true,
                isAdmin: req.user.role === "admin"
            });
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    renderProductDetail = async (req, res) => {
        const productId = req.params.pid;
        const cartId = req.user.cart._id;
        try {
            const product = await services.productService.getProductById(productId);

            if (!product) {
                return res.status(404).send("Producto no encontrado");
            }

            const cart = req.user.cart

            const quantity = cart.products.find(product => product.product.toString() === productId)?.quantity || 0;

            res.render('product', { 
                product: product, 
                cartId: cartId, 
                quantity: quantity,
                noAdmin: req.user.role !== "admin",
                userPremium: req.user.role === "premium",
                user: req.user,
                withImg: product.img !== "Sin imagen"
            });
        } catch (error) {
            req.logger.error("Error al obtener el producto", error);
            res.status(500).send("Error interno del servidor");
        }
    }

    renderCartDetail = async (req, res) => {
        const cartId = req.params.cid;
        const userCartId = req.user.cart._id

        try {
            const cart = await services.cartService.getCartProducts(cartId);

            if (!cart) {
                return res.render("404");
            }

            if (cartId.toString() !== userCartId.toString()) {
                return res.render("404")
            } else {
                res.render("cart", { cart: cart, cartId: cartId, userPremium: req.user.role === "premium", noAdmin: req.user.role !== "admin" });
            }

        } catch (error) {
            req.logger.error("Error al obtener el carrito", error);
            res.status(500).send("Error interno del servidor")
        }
    }

    renderPurchase = async (req, res) => {
        const cartId = req.params.cid;
        try {
            const cart = await services.cartService.getCartProducts(cartId);

            if (!cart) {
                return res.status(404).send("Carrito no encontrado");
            }

            res.render("checkout");
        }
        catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    renderPremium = async (req, res) => {
        res.render("premium", {
            user: req.user, 
            withoutDocuments: req.user.docuements.length === 0,
            withDocuments: req.user.documents.length !== 0,
        });
    }

    renderLogin = async (req, res) => {
        res.render("login");
    }

    renderRegister = async (req, res) => {
        res.render("register");
    }

    renderProfile = async (req, res) => {
        res.render("profile", { 
            user: req.user, 
            userPremium: req.user.role === "premium", 
            noAdmin: req.user.role !== "admin", 
            isAdmin: req.user.role === "admin" 
        });
    }

    renderMockingProducts = async (req, res) => {
        const products = [];
        for (let i = 0; i < 100; i++) {
            products.push(generateProducts());
        };
        res.send(products);
    }

    renderLoggerTest = async (req, res) => {
        req.logger.http("Mensaje HTTP");
        req.logger.fatal("Mensaje FATAL");
        req.logger.error("Mensaje ERROR");
        req.logger.warning("Mensaje WARNING");
        req.logger.info("Mensaje INFO");
        req.logger.debug("Mensaje DEBUG");

        res.send("Logs generados")
    }

    renderResetPassword = async (req, res) => {
        res.render("resetpassword");
    }

    renderChangePassword = async (req, res) => {
        res.render("changepassword");
    }

    renderConfirmaciónEnvio = async (req, res) => {
        res.render("confirmacionEnvio");
    }
}

export default ViewsController;