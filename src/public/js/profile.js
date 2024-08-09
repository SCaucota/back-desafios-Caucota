function becomePremium() {
    const premiumButton = document.querySelector(".become-premium-button");
    premiumButton.addEventListener('click', async (event) => {
        const idUser = event.target.getAttribute('data-user-id');
        const response = await fetch(`/api/users/premium/${idUser}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(response.ok) {
            window.location.href = "/products";
        }else{
            console.log("Error al vaciar el carrito");
        }
    })
}

becomePremium();