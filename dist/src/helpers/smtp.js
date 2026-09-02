import nodemailer from "nodemailer";
import { MailtrapTransport, MailtrapClient } from "mailtrap";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { SMTP_API_KEY, EMAIL_FROM } from "../lib/constants.js";
/**
 * @class EmailService
 * @description Handles sending emails using nodemailer and EJS templates.
 */
class EmailService {
    transporter;
    mailtrapClient;
    constructor() {
        this.transporter = nodemailer.createTransport(MailtrapTransport({
            token: SMTP_API_KEY,
        }));
        this.mailtrapClient = new MailtrapClient({
            token: SMTP_API_KEY,
            bulk: true,
        });
    }
    /**
     * Sends an email using an EJS template.
     * @param to - The recipient's email address.
     * @param subject - The subject of the email.
     * @param template - The name of the EJS template file (without the .ejs extension).
     * @param data - The data to pass to the EJS template.
     */
    async sendEmail(to, subject, template, data) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const templatePath = path.join(__dirname, `./templates/${template}.ejs`);
        try {
            const html = await ejs.renderFile(templatePath, data);
            const sender = {
                address: EMAIL_FROM,
                name: "Ade's Notes",
            };
            const mailOptions = { from: sender, to: [...to], subject, html };
            await this.transporter.sendMail(mailOptions);
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw new Error("Could not send email.");
        }
    }
    /**
     * Sends an email using an EJS template.
     * @param to - The recipient's email address.
     * @param subject - The subject of the email.
     * @param template - The name of the EJS template file (without the .ejs extension).
     * @param data - The data to pass to the EJS template.
     */
    async sendBulkEmail(to, subject, template, data) {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const templatePath = path.join(__dirname, `./templates/${template}.ejs`);
        try {
            const html = await ejs.renderFile(templatePath, data);
            const sender = {
                email: EMAIL_FROM,
                name: "Ade's Notes",
            };
            const others = to.splice(1);
            const mailOptions = {
                from: sender,
                to,
                bcc: others,
                subject,
                html,
                category: "newsletter",
            };
            await this.mailtrapClient.send(mailOptions);
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw new Error("Could not send email.");
        }
    }
}
export default new EmailService();
