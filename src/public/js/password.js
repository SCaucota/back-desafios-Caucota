document.getElementById('button-password').addEventListener('click', function () {
    const passwordField = document.getElementById('password');
    const passwordFieldType = passwordField.getAttribute('type');
    
    // Toggle between password and text
    if (passwordFieldType === 'password') {
        passwordField.setAttribute('type', 'text');
        this.innerHTML = '<img class="eye-login-password" src="/assets/icons/cerrar-ojo.png" alt="ver-contraseña">';  // Cambia el icono a un ojo tachado
    } else {
        passwordField.setAttribute('type', 'password');
        this.innerHTML = '<img class="eye-login-password" src="/assets/icons/ojo.png" alt="ver-contraseña">';  // Cambia el icono al ojo
    }
});