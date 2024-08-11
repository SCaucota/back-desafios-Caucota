function becomePremium() {
    const buttons = document.querySelectorAll(".become-premium-button");

    buttons.forEach((button) => {
        button.addEventListener('click', async (event) => {
            const idUser = event.target.getAttribute('data-user-id');
            const response = await fetch(`/api/users/premium/${idUser}`, {
                method: 'PUT',
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
    })
}

becomePremium();