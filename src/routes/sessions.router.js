import express from "express";
import passport from "passport";
import UserDto from "../dto/user.dto.js";
import SessionController from "../controllers/sessionController.js";
const router = express.Router();

const sessionController = new SessionController();

router.post("/register", sessionController.register);
router.post("/login", sessionController.login);
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login", session: false }), sessionController.githubcallback);
router.post("/logout", sessionController.logout);
router.get("/admin", passport.authenticate("jwt", {session: false}), sessionController.adminAccess);
router.post("/requestPasswordReset", sessionController.requestPasswordReset);
router.post("/resetPassword", sessionController.resetPassword);
router.get("/current", passport.authenticate("jwt", {session: false}), (req, res) => {

    const userDto = new UserDto({
        id: req.user._id,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        cart: req.user.cart,
        role: req.user.role
    });

    res.json({user: userDto});
});

export default router;