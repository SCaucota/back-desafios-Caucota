const socket = io();

socket.emit("getProducts")

socket.on("products", (data) => {
    renderProductos(data);
});

const renderProductos = (products) => {
    const productsContainer = document.getElementById("productsContainer");
    productsContainer.innerHTML = "";

    if(products.length !== 0){

        products.forEach(item => {
            const card = document.createElement("div");
            card.classList = "card";
            card.style = "width: 18rem";
            card.innerHTML = `  <div class="card-body">
                                    <p class="card-title"> ID: ${item._id}</p>
                                    <h2 class="card-title"> Titulo: ${item.title}</h2>
                                    <p class="card-text"> Precio: ${item.price} </p>
                                    <button class="btn btn-primary">Eliminar</button>
                                </div>
                            `
            productsContainer.appendChild(card);

            card.querySelector("button").addEventListener("click", () => {
                deleteProduct(item._id);
            });
        });
    }else {
        const messageWithoutProducts = document.createElement("p");
        messageWithoutProducts.textContent = "Todavía no has agregado ningún producto"
        productsContainer.appendChild(messageWithoutProducts)
    }
};

const deleteProduct = (id) => {
    socket.emit("deleteProduct", id);
};



const addProduct = () => {
    const product = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        code: document.getElementById("code").value,
        price: document.getElementById("price").value,
        img: document.getElementById("img").value,
        status: document.getElementById("status").value,
        stock: document.getElementById("stock").value,
        category: document.getElementById("category").value
    };
    socket.emit("addProduct", product);
};

const sendButton = document.getElementById("btnSend").addEventListener("click", (event) => {
    event.preventDefault();
    addProduct()
})
