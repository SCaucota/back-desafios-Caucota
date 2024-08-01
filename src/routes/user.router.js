import express from "express";
import passport from "passport";
const router = express.Router();
import UserController from "../controllers/userController.js";

const userController = new UserController();

router.put("/user/premium/:uid", userController.cambiarRolPremium)
router.get('/user', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({
        id: req.user._id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        cart: req.user.cart,
        role: req.user.role
    });
});
router.delete("/user/:uid", passport.authenticate('jwt', { session: false }), userController.deleteUser);


export default router;