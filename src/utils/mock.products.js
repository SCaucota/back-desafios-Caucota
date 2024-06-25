import {faker} from "@faker-js/faker";

export const generateProducts = () => {
    return{
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.number.hex({ min: 0, max: 65535 }),
        price: faker.number.int({ min: 9000, max: 30000 }),
        img: faker.lorem.word(),
        status: faker.datatype.boolean(0.9),
        stock: faker.number.int(300),
        category: faker.commerce.productAdjective()
    }
}