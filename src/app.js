import express from "express";
import exphbs from "express-handlebars";
import { Server } from "socket.io";

import viewsRouter from "./routes/views.router.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import sessionRouter from "./routes/sessions.router.js";
import userRouter from "./routes/user.router.js";

import ProductManager from "./controllers/productManager.js";
import MessageModel from "./models/message.model.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import "./database.js";
const app = express();
const PUERTO = 8080;

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static("./src/public/"));

app.engine("handlebars", exphbs.engine());

app.set("view engine", "handlebars");

app.set("views", "./src/views");

initializePassport();

app.use(passport.initialize());
app.use(passport.session());


app.use("/", viewsRouter);
app.use("/api", productsRouter);
app.use("/api", cartsRouter);
app.use("/api/session", sessionRouter)
app.use("/api", userRouter);

const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el puerto http//localhost:${PUERTO}`);
});

const io = new Server(httpServer);
const productManager = new ProductManager;

io.on("connection", async (socket) => {
    console.log("Un cliente se conecto");

    socket.emit("products", await productManager.getProducts());

    socket.on("deleteProduct", async (id) => {
        await productManager.deleteProduct(id);

        socket.emit("products", await productManager.getProducts());
    });

    socket.on("addProduct", async (product) => {
        const {title, description, code, price, img, status, stock, category} = product;
        await productManager.addProduct(title, description, code, price, img, status, stock, category);
        socket.emit("products", await productManager.getProducts());
    })

    socket.on("message", async data => {
        await MessageModel.create(data);

        const messages = await MessageModel.find();

        io.sockets.emit("message", messages)
    });
});