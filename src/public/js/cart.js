const total = document.querySelector(".total");

function eliminarProducto() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach((button) => {
        button.addEventListener('click', async (event) => {
            const idCart = event.target.getAttribute('data-cart-id');
            const idProduct = event.target.getAttribute('data-product-id');
            const quantity = event.target.getAttribute("data-product-quantity");
            const price = event.target.getAttribute("data-product-price");

            const response = await fetch(`/api/carts/${idCart}/product/${idProduct}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(response.ok) {
                event.target.parentElement.remove();
                const newTotal = parseInt(total.textContent) - parseInt(quantity * price);
                total.textContent = newTotal;
                const remainingProducts = document.querySelectorAll('.product');
                if(remainingProducts.length === 0) {
                    window.location.reload();
                }
            }else{
                console.log("Error al eliminar el producto");
            }
        });
    });
}

function vaciarCarrito() {
    const emptyCartButton = document.querySelector(".empty-button");
    emptyCartButton.addEventListener('click', async (event) => {
        const idCart = event.target.getAttribute('data-cart-id');
        const response = await fetch(`/api/carts/${idCart}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(response.ok) {
            window.location.reload();
        }else{
            console.log("Error al vaciar el carrito");
        }
    })
}

eliminarProducto();
vaciarCarrito();