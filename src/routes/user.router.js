import express from "express";
import passport from "passport";
const router = express.Router();
import UserController from "../controllers/userController.js";
import upload from "../middleware/multer.js";

const userController = new UserController();

router.put("/premium/:uid", userController.cambiarRolPremium);
router.get('/', userController.getAllUsers);
router.delete('/', userController.deleteInactiveUsers)
router.delete("/:uid", passport.authenticate('jwt', { session: false }), userController.deleteUser);
router.post(
    "/:uid/documents", 
    upload.fields([
        {name: "profile", maxCount: 1}, 
        {name: "products"} ,
        {name: "documents", maxCount: 3}]), 
    userController.uploadUserDocuments);

export default router;