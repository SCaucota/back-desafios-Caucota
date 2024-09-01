const socket = io();

socket.emit("getProducts")

socket.on("products", (data) => {
    renderProductos(data);
});

const renderProductos = (products) => {
    const productsContainer = document.getElementById("productsContainer");
    productsContainer.innerHTML = "";

    if (products.length !== 0) {

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
    } else {
        const messageWithoutProducts = document.createElement("p");
        messageWithoutProducts.textContent = "Todavía no has agregado ningún producto"
        productsContainer.appendChild(messageWithoutProducts)
    }
};

const deleteProduct = async (id) => {
    try {
        const response = await fetch('/api/products/' + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error("No se pudo borrar el producto");
        }

        socket.emit("deleteProduct");
    } catch (error) {
        console.log("Error al elminar el producto")
    }
};


const addProduct = async () => {
    console.log("Pasa por el addProductMain2");
    const formData = new FormData();
    formData.append('title', document.getElementById("title").value);
    formData.append('description', document.getElementById("description").value);
    formData.append('code', document.getElementById("code").value);
    formData.append('price', document.getElementById("price").value);
    formData.append('img', document.getElementById("img").files[0]); // Archivos deben ser añadidos como archivos binarios
    formData.append('status', document.getElementById("status").value);
    formData.append('stock', document.getElementById("stock").value);
    formData.append('category', document.getElementById("category").value);
    
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
    }

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            body: formData,  // Enviar FormData
        });

        if (!response.ok) {
            throw new Error("No se pudo agregar el producto");
        }
        console.log("Producto añadido, emitiendo evento addProduct");
        socket.emit("addProduct");
    } catch (error) {
        console.log("Error al eliminar el producto", error);
    }
};

const sendButton = document.getElementById("btnSend").addEventListener("click", (event) => {
    event.preventDefault();
    addProduct()
})
