import ProductModel from "../models/product.model.js";

class ProductRepository {
    async addProduct(productsData, user) {
        try {
            console.log("userRepositoryAdd: ", user)
            console.log("productsDataRepository: ",productsData)
            if(user && user.role === "premium"){
                productsData.owner = user.email
            }

            const newProduct = new ProductModel(productsData);
            await newProduct.save();/* 
            console.log("productData: ",productsData) */
            return newProduct;
        } catch (error) {
            throw new Error("Error al agregar el nuevo producto" + error);
        }
    }

    async getProducts(user) {
        try {
            console.log("userRepository: ", user)
            if(user && user.role === "premium"){
                console.log("pasa por premium repository")
                return await ProductModel.find({owner: user.email }).lean()
            }else{
                console.log("Pasa por NOOO premium repository")
                return await ProductModel.find().lean();
            }
        } catch (error) {
            throw new Error("Error al obtener los Productos", error);
        }
    }

    async getProductById(id) {
        try {
            const product = await ProductModel.findById(id).lean();
            return product;
        } catch (error) {
            throw new Error("Error al obtener el producto requerido", error);
        }
    }

    async getProductByCode(coder){
        try {
            return await ProductModel.findOne({code: coder}).lean();
        } catch (error) {
            throw new Error ("Error al buscar el producto por código");
        }
    }

    async updateProduct(id, fields) {
        try {
            const updatedProduct = await ProductModel.findByIdAndUpdate(id, fields, {new: true}).lean();
            return updatedProduct;
        } catch (error) {
            throw new Error("Error al actualizar el producto", error);
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await ProductModel.findByIdAndDelete(id).lean();
            if(!deletedProduct) {
                throw new Error(`El producto de id "${id}" no existe`);
            }
            return deletedProduct;
        } catch (error) {
            throw new Error("Error al eliminar el producto", error);
        }
    }
}

export default ProductRepository;