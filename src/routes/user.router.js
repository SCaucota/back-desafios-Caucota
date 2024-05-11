import express from "express";
import passport from "passport";
const router = express.Router();

router.post("/register",  passport.authenticate("register", {
    failureRedirect: "/failregister",
}),async (req, res) => {
    if(!req.user){
        return res.status(400).send("Credenciales invalidas");
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role
    };

    req.session.login = true;

    res.redirect("/profile");
})

router.get("/failedregister", (req, res) => {
    res.send("Credenciales invalidas");
})

export default router