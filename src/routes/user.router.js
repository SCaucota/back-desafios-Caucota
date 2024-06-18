import express from "express";
import passport from "passport";
const router = express.Router();
import UserController from "../controllers/userController.js";

const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login", session: false }), userController.githubcallback);
router.post("/logout", userController.logout);
router.get("/admin", passport.authenticate("jwt", {session: false}), userController.adminAccess)
router.get("/products", passport.authenticate("jwt", {session: false}), (req, res) => {
    res.render("products", {email: req.user.email});
})


export default router;