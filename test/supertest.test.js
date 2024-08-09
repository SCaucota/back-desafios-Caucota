import supertest from "supertest";
import { expect } from "chai";
import configObject from "../src/config/config.js";

const requester = supertest("http://localhost:8080");

describe("SuperTest", () => {

    let productTestBody;
    let userCartId;
    let userId;
    let authToken;

    before(async () => {
        const registerResponse = await requester.post("/api/sessions/register")
            .send({
                first_name: "testuser",
                last_name: "lastnametestuser",
                email: "testuser@example.com",
                age: 20,
                password: "testpassword"
            });
        expect(registerResponse.statusCode).to.equal(302);

        const loginResponse = await requester.post("/api/sessions/login")
            .send({
                /* email: "nutellitadivergente@gmail.com",
                password: "hola" */
                email: "testuser@example.com",
                password: "testpassword"
            });
        expect(loginResponse.statusCode).to.equal(302);
        authToken = loginResponse.headers['set-cookie'].find(cookie => cookie.startsWith('coderCookieToken'));

        const productTest = {
            title: "Test Product",
            description: "Producto de testeo",
            code: "test123",
            price: 100,
            img: "Sin imagen",
            status: true,
            stock: 100,
            category: "test"
        };

        const { statusCode, body } = await requester.post("/api/products").send(productTest);
        expect(statusCode).to.equal(200);
        productTestBody = body;

        const {statusCode: userStatusCode, body: userBody} = await requester.get(`/api/users`).set('Cookie', authToken);
        expect(userStatusCode).to.equal(200);
        console.log(userBody)
        userCartId = userBody.cart._id;
        userId = userBody.id
        
    });

    describe("Testing de products: ", async () => {
        it("Limitar los productos para únicamente se muestren 3", async () => {
            const { statusCode, body } = await requester.get("/api/products?limit=3");

            expect(statusCode).to.equal(200);
            expect(body).to.be.an('array');
            expect(body).to.have.lengthOf(3);
        })

        it("Se busca un producto basado en su Id", async () => {
            const id = "663022ac2bb764cfa474748a"

            const { statusCode, body } = await requester.get(`/api/products/${id}`);

            expect(statusCode).to.equal(200);
            expect(body).to.be.an('object');
            expect(body._id).to.equal(id);
        })

        it("Actualización única de campos específicos", async () => {
            const updateData = {
                title: "Test Product Update",
                price: 500
            }

            const { statusCode, body } = await requester.put(`/api/products/${productTestBody._id}`).send(updateData);

            expect(statusCode).to.equal(200);
            expect(body.title).to.equal(updateData.title);

            const productUpdated = await requester.get(`/api/products/${productTestBody._id}`);
            expect(productUpdated.status).to.equal(200);

            const productUpdatedBody = productUpdated.body;

            expect(productUpdatedBody.title).to.equal(updateData.title);
            expect(productUpdatedBody._id).to.equal(productTestBody._id);
            expect(productUpdatedBody.description).to.equal(productTestBody.description);
            expect(productUpdatedBody.code).to.equal(productTestBody.code);
            expect(productUpdatedBody.img).to.equal(productTestBody.img);
            expect(productUpdatedBody.price).to.equal(updateData.price);
            expect(productUpdatedBody.status).to.equal(productTestBody.status);
            expect(productUpdatedBody.stock).to.equal(productTestBody.stock);
            expect(productUpdatedBody.category).to.equal(productTestBody.category);
        })
    })

    describe("Testing de carts: ", async () => {
        it("Añadir un producto con cantidad específica a un carrito existente", async () => {
            const productId = productTestBody._id;
            const cartId = userCartId;
            const quantityBody = {
                quantity: 2
            };

            const productInserted1 = await requester.post(`/api/carts/${cartId}/product/${productId}`).set('Cookie', authToken).send(quantityBody);

            expect(productInserted1.statusCode).to.equal(302);

            const { statusCode, body } = await requester.get(`/api/carts/${cartId}`).set('Cookie', authToken);
            expect(statusCode).to.equal(200);

            const addedProduct = body.products.find(product => product.product._id === productId);

            expect(addedProduct).to.exist;
            expect(addedProduct.quantity).to.equal(2);
        });

        it("Modificar carrito completo sin cantidad esta debe ser 1 x producto", async() => {
            const cartId = userCartId;
            const newProducts = [
                {
                    product: "6626a9692bb764cfa4747441"
                },
                {
                    product: "6626a9692bb764cfa4747444"
                }
            ]

            const { statusCode, body } = await requester.put(`/api/carts/${cartId}`).set('Cookie', authToken).send(newProducts);
            const quantities = body.products.map(product => product.quantity);

            expect(statusCode).to.equal(200);
            expect(body).to.be.a('object');
            quantities.forEach(quantity => expect(quantity).to.equal(1));
        })

        it("Actualización total Carrito", async () => {
            const cartId = userCartId;

            const { statusCode, body } = await requester.get(`/api/carts/${cartId}`).set('Cookie', authToken);
            
            const updatedProducts = body.products;
            const product1 = updatedProducts.find(product => product.product._id === "6626a9692bb764cfa4747441");
            const product2 = updatedProducts.find(product => product.product._id === "6626a9692bb764cfa4747444");

            const expectedTotalPrice = (product1.quantity * product1.product.price) + (product2.quantity * product2.product.price);
            expect(statusCode).to.equal(200);
            expect(body.total).to.equal(expectedTotalPrice);
        })
    })

    describe("Testing de sessions: ", async () => {
        it("Se obtiene información del usuario actual", async () => {
            const {body} = await requester.get('/api/sessions/current').set('Cookie', authToken);

            expect(body.user.email).to.have.equal("testuser@example.com");
            expect(body.user.cart._id).to.have.equal(userCartId);
        });

        it("Logout existoso, sin cookie y redirigir al login", async () => {
            const result = await requester.post('/api/sessions/logout').set('Cookie', authToken);
            expect(result.statusCode).to.equal(302);
            expect(result.headers.location).to.equal('/login');

            const newLoginResponse = await requester.get(`/products`);
            expect(newLoginResponse.statusCode).to.equal(302);
            expect(newLoginResponse.headers.location).to.equal('/login');
        })

        it("Login de admin exitosa y sin acceso a compra de productos", async () => {
            let adminToken;
            const loginResponse = await requester.post('/api/sessions/login')
                .send({
                    email: configObject.ADMIN_EMAIL,
                    password: configObject.ADMIN_PASSWORD
                });
            expect(loginResponse.statusCode).to.equal(302);
            expect(loginResponse.headers.location).to.equal('/realtimeproducts');;
            
            adminToken = loginResponse.headers['set-cookie'].find(cookie => cookie.startsWith('coderCookieToken'));

            const rejectedResponse = await requester.get('/products').set('Cookie', adminToken);
            expect(rejectedResponse.statusCode).to.equal(302);
            expect(loginResponse.headers.location).to.equal('/realtimeproducts');;
        })
    });

    after(async () => {
        console.log("Deleting product:", productTestBody._id);
        await requester.delete(`/api/products/${productTestBody._id}`);
        console.log("Deleting user:", userId);
        await requester.delete(`/api/users/${userId}`).set('Cookie', authToken);
    })
})