import services from "../services/index.js";
import EmailManager from "../services/email.js";

const emailManager = new EmailManager();

class UserController {

    getAllUsers = async (req, res) => {
        try {
            const users = await services.userService.getAllUsers();

            const mainDataUser = users.map(user => {
                return {
                    _id: user._id,
                    name: user.first_name,
                    surname: user.last_name,
                    email: user.email,
                    role: user.role
                }
            })

            res.send(mainDataUser)
        } catch (error) {
            req.logger.error("Error al traer todos los usuarios" + error);
            res.status(500).json({error: "Error interno del servidor"})
        }
    }

    deleteInactiveUsers = async (req, res) => {
        try {
            const users = await services.userService.getAllUsers();

            const actualDate = new Date();

            const twoDaysAgo = new Date(actualDate);
            twoDaysAgo.setDate(actualDate.getDate() - 2)

            const inactiveUsers = users.filter(user => {
                const lastConnection = new Date(user.last_connection);
                return lastConnection <= twoDaysAgo
            });

            await Promise.all(
                inactiveUsers.map(async (user) => {
                    if(user.role === "premium"){
                        const allProducts = await services.productService.getProducts();
                        const productsUser = allProducts.filter(product => product.owner === user.email);
                        if(productsUser.length > 0) {
                            await Promise.all(
                                productsUser.map(async (product) => {
                                    await services.productService.deleteProduct(product._id);
                                })
                            )
                        }
                    }
                    await emailManager.sendEmailDeletedAccountUser(user.email, user.first_name, user.last_name);
                    await services.cartService.deleteCart(user.cart);
                    await services.userService.deleteUser(user._id)
                })
            )

            res.status(200).send("Eliminación de usuarios inactivos exitosa")
        } catch (error) {
            res.status(500).send("Error en el servidor" + error)
        }
    }
   
   cambiarRolPremium = async (req, res) => {
       const {uid} = req.params;

       try {
           const user = await services.userService.getUserById(uid)

           if(!user) {
               return res.status(404).send("Usuario no encontrado");
           }

           const documentsName = user.documents.map(document => document.name);

           const docsRequired = [ "identificacion", "comprobantedomicilio", "comprobantedeestadodecuenta" ]

           const docs = docsRequired.every(doc => documentsName.includes(doc))

           if(user.role === "premium") {
                const newRole = user.role = "user";

                const actualizado = await services.userService.changeUserRol(uid, newRole)

                res.json(actualizado)

           }else if(user.role === "user") {

                if(docs) {
                    const newRole = user.role = "premium";

                    const actualizado = await services.userService.changeUserRol(uid, newRole)

                    res.json(actualizado)
                }else {
                    res.status(400).send("Faltan documentos por cargar")
                }   

           }

        } catch (error) {
           res.status(500).send("Error en el servidor" + error)
        }
    }

    deleteUser = async (req, res) => {
        try {
            const id = req.params.uid;
            const userCartId = req.user.cart._id;
            await services.userService.deleteUser(id);
            await services.cartService.deleteCart(userCartId);
            res.status(200).send({meesage: "Se eliminó exitosamente el usuario"});

        } catch (error) {
            res.status(500).json({error: "Error en el servidor"});
        }

    };

    uploadUserDocuments = async (req, res) => {
        const userId = req.params.uid;
        const files = req.files;
        try {

            if(!userId) {
                return res.status(404).send("Usuario no encontrado");
            }

            if(!files) {
                return res.status(404).send("No se encontraron archivos");
            }

            await services.userService.uploadUserDocuments(userId, files);

            res.status(200).render("premium");
        } catch (error) {
            res.status(500).send("Error en el servidor" + error)
        }
    }
}

export default UserController;