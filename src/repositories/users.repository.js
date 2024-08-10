import UserModel from "../models/user.model.js";

class UserRepository {
    async createUser(user) {
        try {
            const newUser = new UserModel(user);
            return await newUser.save();
        } catch (error) {
            throw new Error("Error al agregar el nuevo usuario", error);
        }
    }

    async getUserByEmail(email) {
        try {
            return await UserModel.findOne({email}).lean();
        } catch (error) {
            throw new Error("Error al buscar el usuario por el email", error);
        }
    }

    async getUserById(id) {
        try {
            return await UserModel.findById(id).lean();
        } catch (error) {
            throw new Error("Error al buscar el usuario por el id", error);
        }
    }

    async updateToken(idUser, updateData) {
        try {
            const userToUpdate = await UserModel.findById(idUser);

            if(!userToUpdate) throw new Error("Usuario no encontrado");

            userToUpdate.resetToken = updateData.resetToken;

            return await userToUpdate.save();
        } catch (error) {
            throw new Error("Error al actualizar el usuario", error);
        }
    }

    async updateUser(idUser, password, resetToken) {
        try {
            const userToUpdate = await UserModel.findById(idUser);

            if(!userToUpdate) throw new Error("Usuario no encontrado");

            if (password) userToUpdate.password = password;
            if (resetToken !== undefined) userToUpdate.resetToken = resetToken;

            return await userToUpdate.save();
        } catch (error) {
            throw new Error("Error al actualizar el usuario" + error);
        }
    }

    async changeUserRol(id, nuevoRole) {
        try {
            return await UserModel.findByIdAndUpdate(id, {role: nuevoRole}, {new: true}).lean()
        } catch (error) {
            throw new Error("Error al cambiar el rol" + error);
        }
    }

    async deleteUser(id) {
        try {
            const deleteUser = await UserModel.findByIdAndDelete(id).lean();
            if(!deleteUser) throw new Error("Usuario no encontrado");
            
            return deleteUser
        } catch (error) {
            throw new Error("Error al eliminar el usuario", error);
        }

    }

    async uploadUserDocuments(id, uploadDocs) {
        try {
            const user = await UserModel.findById(id);

            if(!user) throw new Error("Usuario no encontrado")

            if(uploadDocs.profile) {
                user.documents = user.documents.concat(
                    uploadDocs.profile.map(doc => {
                        return {
                            name: doc.originalname.split(".")[0].toLowerCase().replace(/\s+/g, ''),
                            reference: doc.path
                        }
                    })
                );
            }

            if(uploadDocs.product) {
                user.documents = user.documents.concat(
                    uploadDocs.product.map(doc => {
                        return {
                            name: doc.originalname.split(".")[0].toLowerCase().replace(/\s+/g, ''),
                            reference: doc.path
                        }
                    })
                )
            }

            if(uploadDocs.document) {
                user.documents = user.documents.concat(
                    uploadDocs.document.map(doc => {
                        return {
                            name: doc.originalname.split(".")[0].toLowerCase().replace(/\s+/g, ''),
                            reference: doc.path
                        }
                    })
                )
            }

            await user.save();

        } catch (error) {
            throw new Error("Error al cargar los documentos", error);
        }
    }
}

export default UserRepository;