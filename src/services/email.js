import nodemailer from "nodemailer";
import configObject from "../config/config.js";

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: configObject.MAILING_USER,
                pass: configObject.MAILING_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        })
    }

    async sendEmailTicket(email, ticketId) {
        try {
            const mailOptions = {
                from: configObject.MAILING_USER,
                to: email,
                subject: `Confirmación de Compra - Ticket No. ${ticketId}`,
                html: `
                    <h1>Ticket de compra: ${ticketId}</h1>
                    <h2>¡Muchas gracias por tu compra!</h2>
                    <p>Nos complace informarte que tu compra se ha generado exitosamente.</p>
                    <p>Tu pedido está siendo procesado y te notificaremos tan pronto como sea enviado.</p>
                    <br>
                    <p>Gracias por confiar en Bibliomaniacs. ¡Esperamos verte pronto de nuevo!</p>
                    <br>
                    <p>Atentamente,</p>
                    <p>El equipo de Bibliomaniacs</p>
                `
            };
            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            console.log('Error al enviar el email', error)
        }
    }

    async sendEmailDeletedAccountUser(email, first_name, last_name) {
        try {
            const mailOptions = {
                from: configObject.MAILING_USER,
                to: email,
                subject: "Notificación de Eliminación de Cuenta por Inactividad",
                html: `
                    <h2>Estimado/a ${first_name} ${last_name},</h2>
                    <p>Esperamos que se encuentre bien. Le informamos que, debido a un período prolongado de inactividad en nuestra plataforma, su cuenta ha sido <strong>eliminada</strong> de acuerdo con nuestras políticas de uso.</p>
                    <p>Entendemos que esto puede ser inesperado, y lamentamos cualquier inconveniente que esto pueda causar.</p>
                    <p>Si desea volver a ser parte de nuestra comunidad, puede registrarse nuevamente en cualquier momento. Simplemente siga el siguiente enlace para crear una nueva cuenta:</p>
                    <p><a href="http://localhost:8080/register">Registrarse</a></p>
                    <p>Gracias por su comprensión, y esperamos darle la bienvenida de nuevo en el futuro.</p>
                    <br>
                    <p>Atentamente,</p>
                    <p>El equipo de Bibliomaniacs</p>
                `
            };
            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            console.log('Error al enviar el email', error)
        }
    }

    async sendEmailPremiumProductDeleted(email, protuctTitle) {
        try {
            const mailOptions = {
                from: configObject.MAILING_USER,
                to: email,
                subject: "Notificación de Eliminación de Producto",
                html: `
                    <h2>Estimado/a: </h2>
                    <p>Lamentamos informarle que su producto: "${protuctTitle}", ha sido eliminado de nuestra plataforma.</p>
                    <p>Esto puede deberse a una de las siguientes razones:</p>
                    <ul>
                        <li>El producto ya no cumple con nuestras políticas de uso o condiciones de servicio.</li>
                        <li>Hemos detectado problemas técnicos con la publicación del producto.</li>
                        <li>El producto ha sido marcado como inapropiado o no permitido en nuestra plataforma.</li>
                    </ul>
                    <p>Gracias por su comprensión.</p>
                    <br>
                    <p>Atentamente,</p>
                    <p>El equipo de Bibliomaniacs</p>
                `
            };
            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            console.log('Error al enviar el email', error)
        }
    }

    async enviarCorreoRestablecimiento(email, first_name, token) {
        try {
            const mailOptions = {
                from: configObject.MAILING_USER,
                to: email,
                subject: "Restablecimiento de contraseña",
                html: `
                    <h1>Solicitud de Restablecimiento de Contraseña</h1>
                    <p>Hola, ${first_name},</p>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    <p>Para proceder con el restablecimiento, utiliza el siguiente código de confirmación:</p>
                    <strong style="font-size: 1.5em;">${token}</strong>
                    <p>Este código es válido por una hora.</p>
                    <p>Una vez que hayas copiado el código, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    <p><a href="http://localhost:8080/changepassword">Restablecer contraseña</a></p>
                    <br>
                    <p>Atentamente,</p>
                    <p>El equipo de Bibliomaniacs</p>
                `
            }

            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            console.log('Error al enviar el correo de restablecimiento', error)
        }
    }
}

export default EmailManager;