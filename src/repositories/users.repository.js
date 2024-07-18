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
}

export default UserRepository;