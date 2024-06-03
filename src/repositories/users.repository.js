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
}

export default UserRepository;