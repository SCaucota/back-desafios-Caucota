import express from "express";
import passport from "passport";
const router = express.Router();
import UserController from "../controllers/userController.js";
import upload from "../middleware/multer.js";

const userController = new UserController();

router.put("/premium/:uid", userController.cambiarRolPremium)
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
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
router.delete("/:uid", passport.authenticate('jwt', { session: false }), userController.deleteUser);
router.post(
    "/:uid/documents", 
    upload.fields([
        {name: "profile", maxCount: 1}, 
        {name: "products"} ,
        {name: "documents", maxCount: 3}]), 
    userController.uploadUserDocuments);

export default router;