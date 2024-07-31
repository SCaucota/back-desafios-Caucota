import mongoose from "mongoose";
import configObject from "../src/config/config.js";
import assert from "assert";
import Product from "../src/repositories/products.repository.js";

mongoose.connect(configObject.MONGO_URL);

describe("Testeamos el model de Products", function () {
    before(function() {
        this.productRepository = new Product();
    })

    /* beforeEach(async function() {
        await mongoose.connection.collections.products.drop();
    }) */

    it("Se debe poder agregar un producto nuevo a la DB", async function() {
        let product = {
            title: "test2",
            description: "test",
            code: "test2",
            price: 100,
            img: "Sin imagen",
            status: true,
            stock: 100,
            category: "test"
        }

        const result = await this.productRepository.addProduct(product);
        assert.ok(result._id)
    })

    it("El get de products me retona una array", async function() {
        const result = await this.productRepository.getProducts()
        assert.strictEqual(Array.isArray(result), true)
    })

    it("Se debe devolver un producto en particular a partir de su ID", async function() {
        const result = await this.productRepository.getProductById("6626a9692bb764cfa4747441");
        assert.ok(result._id)
    })

    it("Devuelve un producto a partir de su code", async function() {
        const result = await this.productRepository.getProductByCode("abc12");
        assert.ok(result._id)
    })

    it("Actualiza un producto", async function() {
        const result = await this.productRepository.updateProduct("6626a9692bb764cfa4747441", {title: "test2"});
        assert.ok(result._id)
    })

    it("Elimina un producto", async function() {
        const result = await this.productRepository.deleteProduct("66a9499370f792c3508e0761");
        assert.ok(result._id)
    })

    after(async function() {
        await mongoose.disconnect()
    })
})