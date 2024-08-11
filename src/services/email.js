import nodemailer from "nodemailer";
import configObject from "../config/config.js";

class EmailManager {
    constructor () {
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

    async sendEmailTicket (email, ticketId) {
        try {
            const mailOptions = {
                from: configObject.MAILING_USER,
                to: email,
                subject: "Ticket de compra",
                html: `
                    <h1>Ticket de compra: ${ticketId}</h1>
                    <h2>Tu compra se generó exitosamente</h2>
                    <h2>¡Muchas gracias por tu compra!</h2>
                `
            };
            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            console.log('Error al enviar el email', error)
        }
    }

    async sendEmailDeletedAccountUser (email, first_name, last_name) {
        try {
            const mailOptions = {
                from: configObject.MAILING_USER,
                to: email,
                subject: "Eliminación de cuenta por inactividad",
                html: `
                    <h2>${first_name} ${last_name}</h2>
                    <h2>Debido a su inactividad en nuestro sitio, su cuenta ha sido <strong>Eliminada</strong></h2>
                    <p>Si desea volver a registrarse, diríjase a la sección de <a href="http://localhost:8080/register">Registrarse</a></p>
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
                    <h1>Restablecimiento de contraseña</h1
                    <p>Se restablecerá tu contraseña, ${first_name}!</p>
                    <p>Código de confirmación: </p>
                    <strong>${token}</strong>
                    <p>Este código expira en una hora</p>
                    <a href="http://localhost:8080/changepassword">Restablecer contraseña</a>
                `
            }

            await this.transporter.sendMail(mailOptions)
        } catch (error) {
            console.log('Error al enviar el correo de restablecimiento', error)
        }
    }
}

export default EmailManager;