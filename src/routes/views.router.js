import { Router } from "express";
import passport from "passport";
const router = Router();
import ViewController from "../controllers/viewsController.js";
const viewsController = new ViewController();

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

router.get("/", checkAuthenticated, viewsController.checkAuthenticated);
router.get(
    "/products",
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    verifyRol(["user", "premium"]), 
    viewsController.renderProducts
);
router.get(
    "/chat",
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    verifyRol(["user", "premium"]),
    viewsController.renderChat
);
router.get(
    "/realtimeproducts",
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    verifyRol(["admin", "premium"]), 
    viewsController.renderRealTimeProducts
);
router.get(
    "/adminUsers",
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    verifyRol(["admin"]),
    viewsController.renderUsers
);
router.get(
    "/products/:pid",
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    verifyRol(["user", "premium"]),
    viewsController.renderProductDetail
);
router.get(
    "/carts/:cid", 
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    verifyRol(["user", "premium"]),
    viewsController.renderCartDetail
);
router.get(
    "/carts/:cid/purchase",
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    verifyRol(["user", "premium"]),
    viewsController.renderPurchase
);
router.get("/login", checkAuthenticated, viewsController.renderLogin);
router.get("/register", checkAuthenticated, viewsController.renderRegister);
router.get(
    "/profile",
    passport.authenticate("jwt", { session: false, failureRedirect: "/login" }),
    viewsController.renderProfile
);
router.get("/mockingproducts", viewsController.renderMockingProducts);
router.get("/loggerTest", viewsController.renderLoggerTest);
router.get("/resetpassword", viewsController.renderResetPassword);
router.get("/changepassword", viewsController.renderChangePassword);
router.get("/confirmacionEnvio", viewsController.renderConfirmaciónEnvio);

export default router;