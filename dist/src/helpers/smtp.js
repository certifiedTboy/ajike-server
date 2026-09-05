import nodemailer from "nodemailer";
import { MailtrapTransport, MailtrapClient } from "mailtrap";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import { SMTP_API_KEY, EMAIL_FROM, AWS_LAMBDA_URL } from "../lib/constants.js";
import { logger } from "../lib/App.js";
import axios from "axios";
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
            logger.info("email sent success");
        }
        catch (error) {
            logger.error("could not send email", error);
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
            logger.error("error send bulk email", error);
        }
    }
    /**
     * Sends an email through aws lambda.
     * @param to - The recipient's email address.
     * @param subject - The subject of the email.
     * @param template - The name of the EJS template file (without the .ejs extension).
     * @param data - The data to pass to the EJS template.
     */
    async sendEmailWithLambda(to, subject, template, data) {
        try {
            if (!AWS_LAMBDA_URL)
                return console.log("LAMBDA URL is required");
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            const result = await axios.post(AWS_LAMBDA_URL, {
                to,
                subject,
                emailType: template,
                ...data,
            }, config);
            logger.info("email sent successfully", result?.data);
        }
        catch (error) {
            console.log("catch error", error);
            logger.error("error sending email with lambda", error);
        }
    }
}
export default new EmailService();
