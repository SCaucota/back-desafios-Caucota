import passport from "passport";
import local from"passport-local";
import UserModel from "../models/user.model.js";
import GitHubStrategy from "passport-github2";
import { createHash, isValidPassword } from "../utils/hashbcrypt.js";

const LocalStratery = local.Strategy;

const initializePassport = () => {
    passport.use("register", new LocalStratery({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, username, password, done) => {
        const {first_name, last_name, email, age} = req.body;

        try {
            let user = await UserModel.findOne({email});

            if(user) {
                return done(null, false);
            };

            let newUser = {
                first_name,
                last_name,
                email,
                password: createHash(password),
                age,
                role
            };
            
            let result = await UserModel.create(newUser);
            return done(null, result);

        } catch (error) {
            return done(error)
        }
    }));

    passport.use("login", new LocalStratery({
        usernameField: "email",
    }, async (email, password, done) => {
        try {
            let user = await UserModel.findOne({email});

            if( !user ) {
                console.log("Este usuario no existe");
                return done(null, false);
            }

            if(!isValidPassword(password, user)) {
                return done(null, false);
            }

            return done(null, user);

        } catch (error) {
            return done(error);
        }
    }));
    
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({_id: id});
        done(null, user);
    });

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23liDNEaK4kzYyfEe3",
        clientSecret: "beca033de33bdad42b4cbe022b129f003ac24622",
        callbackURL: "http://localhost:8080/api/githubcallback"
    }, async (accessToken, refreshToken, profile, done) => {

        try {
            let user = await UserModel.findOne({email: profile._json.email});

            if(!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 36,
                    email: profile._json.email,
                    password: "miau"
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