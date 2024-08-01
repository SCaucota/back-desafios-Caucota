import passport from "passport";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt";
import services from "../services/index.js";
import configObject from "./config.js";


const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) => {
    let token = null;
    if(req && req.cookies) {
        token = req.cookies["coderCookieToken"];
    }
    return token;
}

const initializePassport = () => {
    passport.use("jwt", new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: configObject.JWT_SECRET
    }, async (jwt_payload, done) => {
        try {
            const user = await services.userService.getUserByEmail(jwt_payload.email);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    })),

    passport.use("github", new GitHubStrategy({
        clientID: configObject.GITHUB_CLIENT_ID,
        clientSecret: configObject.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {

        try {
            let user = await services.userService.getUserByEmail(profile._json.email);

            const newCartId = await services.cartService.addCart();

            if(!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 36,
                    email: profile._json.email,
                    password: "",
                    cart: newCartId
                };

                let result = await services.userService.createUser(newUser);
                done(null, result);
            }else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await services.userService.getUserById(id).lean();
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};



export default initializePassport;