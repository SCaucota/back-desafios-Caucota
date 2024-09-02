import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import passport from "passport";
import services from "../services/index.js";
import MessageModel from "../models/message.model.js";

class SocketManager {
    constructor(httpServer) {
        this.io = new Server(httpServer);
        this.setupMiddleware();
        this.initSocketEvents();
    }

    setupMiddleware() {
        this.io.use((socket, next) => {
            cookieParser()(socket.request, {}, () => {
                passport.authenticate('jwt', { session: false }, (err, user, info) => {
                    if (err) return next(err);
                    if (!user) return next(new Error('Authentication error'));
                    socket.request.user = user;
                    next();
                })(socket.request, {}, next);
            });
        });
    }

    initSocketEvents() {
        this.io.on("connection", async (socket) => {
            console.log("Un cliente se conectó");

            socket.on("getProducts", async () => {
                try {
                    const { user } = socket.request;
                    const products = await services.productService.getProducts(user);
                    socket.emit("products", products);
                } catch (error) {
                    console.error("Error al obtener los productos:", error);
                    socket.emit("error", "Error al obtener los productos");
                }
            });

            socket.on("deleteProduct", async () => {
                try {
                    const { user } = socket.request;
                    socket.emit("products", await services.productService.getProducts(user));
                } catch (error) {
                    console.error("Error al obtener los productos:", error);
                    socket.emit("error", "Error al obtener los productos");
                }
            });

            socket.on("addProduct", async () => {
                try {
                    const { user } = socket.request;
                    socket.emit("products", await services.productService.getProducts(user));
                } catch (error) {
                    console.error("Error al obtener los productos:", error);
                    socket.emit("error", "Error al obtener los productos");
                }
            });

            const messages = await MessageModel.find();
            socket.emit("message", messages);

            socket.on("message", async data => {
                const { user } = socket.request;
                const messageData = {
                    user: user.username,
                    message: data.message
                };
                await MessageModel.create(messageData);
                const messages = await MessageModel.find();
                this.io.sockets.emit("message", messages);
            });
        });
    }
}

export default SocketManager;