import supertest from "supertest";
import {expect} from "chai";

const requester = supertest("http://localhost:8080");

describe("SuperTest", () => {

    describe("Testing de products: ", async() =>{
        it("Endpoint GET /api/products", async() => {
            const {statusCode, body} = await requester.get("/api/products");
            
            expect(statusCode).to.equal(200);
            expect(body.owner).to.be.ok.and.equal("admin");
        })
    })
})