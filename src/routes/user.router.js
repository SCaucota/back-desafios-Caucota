import express from "express";
import passport from "passport";
const router = express.Router();
import UserManager from "../controllers/userManager.js";

const userManager = new UserManager();

router.post("/register", userManager.register);
router.post("/login", userManager.login);
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login", session: false }), userManager.githubcallback);
router.post("/logout", userManager.logout);
router.get("/admin", passport.authenticate("jwt", {session: false}), userManager.adminAccess)
router.get("/products", passport.authenticate("jwt", {session: false}), (req, res) => {
    res.render("products", {email: req.user.email});
})


export default router;