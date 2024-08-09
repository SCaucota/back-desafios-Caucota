import express from "express";
import exphbs from "express-handlebars";
import manejadorError from "./middleware/error.js";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import usersRouter from "./routes/user.router.js";

import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import {addLogger} from "./utils/logger.js";
import "./database.js";
import SocketManager from "./sockets/socketManager.js";

const app = express();
const PUERTO = 8080;

const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentacion App Libros",
            description: "App para la compra y venta de libros"
        },
    },
    apis: ["./src/docs/**/*.yaml"],
}

const specs = swaggerJsdoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static("./src/public/"));
app.use(passport.initialize());
initializePassport();

app.engine("handlebars", exphbs.engine());

app.set("view engine", "handlebars");

app.set("views", "./src/views");

app.use(addLogger);


app.use("/", viewsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter)
app.use("/api/users", usersRouter);

app.use(manejadorError);

const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el puerto http//localhost:${PUERTO}`);
});

const socketManager = new SocketManager(httpServer);