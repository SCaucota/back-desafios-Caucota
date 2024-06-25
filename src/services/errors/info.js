const generateInfoErrorProduct = (product) => {
    return `Los datos están incompletos o no son válidos.
    Necesitamos recibir los siguientes datos:
    - Titulo: ${product.title}
    - Descripción: ${product.description}
    - Codigo: ${product.code}
    - Precio: ${product.price}
    - Imagen: ${product.img}
    - Status: ${product.status}
    - Cantidad: ${product.stock}
    - Categoria: ${product.category}
    `;
}

const generateInfoErrorUser = (user) => {
    return `Los datos están incompletos
    Necesitamos recibir los siguientes datos:
    - Nombre: ${user.first_name}
    - Apellido: ${user.last_name}
    - Email: ${user.email}
    - Edad: ${user.age}
    - Rol: ${user.role}
    `
}

export {generateInfoErrorProduct, generateInfoErrorUser};