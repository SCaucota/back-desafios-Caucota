import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
        type: String
    },
    age: {
        type: Number,
        required: true
    },
    cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts"
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

userSchema.pre("findOne", function(next) {
    this.populate("cart");
    next();
})

const UserModel = mongoose.model("users", userSchema);

export default UserModel;