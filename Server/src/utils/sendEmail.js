import nodemailer from 'nodemailer';

// Configure Nodemailer transporter (Using Ethereal for safe testing/demo)
// To use a real email like Gmail, you would use:
// service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'lola.marquardt@ethereal.email',
        pass: '6m2p3n7JcBzK6M9e23' // Demo ethereal account
    }
});

/**
 * Sends an email notification to a user.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML formatted email body
 */
export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Jansetu Alerts" <noreply@jansetu.com>', // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
