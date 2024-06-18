import express from "express";
import passport from "passport";
import UserDto from "../dto/user.dto.js";
const router = express.Router();

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