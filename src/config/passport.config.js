import passport from "passport";
import UserModel from "../models/user.model.js";
import GitHubStrategy from "passport-github2";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";
import jwt from "passport-jwt";


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
    passport.use("current", new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: "coderhouse"
    }, async (jwt_payload, done) => {
        try {
            const user = await UserModel.findOne({ email: jwt_payload.email }).lean();
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
        clientID: "Iv23liDNEaK4kzYyfEe3",
        clientSecret: "beca033de33bdad42b4cbe022b129f003ac24622",
        callbackURL: "http://localhost:8080/api/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {

        try {
            let user = await UserModel.findOne({email: profile._json.email}).lean();

            if(!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 36,
                    email: profile._json.email,
                    password: ""
                };

                let result = await UserModel.create(newUser);
                done(null, result);
            }else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))
};



export default initializePassport;