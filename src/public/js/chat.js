const socket = io();
const chatBox = document.getElementById("chatBox");
const buttonSend = document.getElementById("btn-send-chat")
const username = document.getElementById("username")

chatBox.addEventListener("keyup", (event) => {
    if(event.key === "Enter") {
        if(chatBox.value.trim().length > 0) {
            socket.emit("message", {message: chatBox.value});
            chatBox.value = "";
        }
    }
});

buttonSend.addEventListener("click", () => {
    if(chatBox.value.trim().length > 0) {
        socket.emit("message", {message: chatBox.value});
        chatBox.value = "";
    }
});

socket.on("message", data => {
    const log = document.getElementById("messagesLogs");
    let messages = "";
    data.forEach(message => {
        const alignmentClass = message.user === username.textContent ? "message-right" : "message-left";
        messages += `
            <div class="${alignmentClass}">
                <strong>${message.user}:</strong> 
                <p class="message">${message.message}</p>
            </div>
        `;
    });
    log.innerHTML = messages;
});