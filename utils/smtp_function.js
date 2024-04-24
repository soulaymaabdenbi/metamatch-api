const nodeMailer = require('nodemailer');

// Rename and adjust the function as needed
async function sendAccountCredentials(userEmail, username, password) {
    try {

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Account Credentials",
            html: `<h1>Welcome to MetaMatch, ${username}!</h1>
                   <p>Your account has been created successfully. Here are your credentials:</p>
                   <p><b>Email:</b> ${userEmail}</p>
                   <p><b>Password:</b> ${password}</p>
                   <p>Please change your password after your first login for security reasons.</p>
                   <p>Thank you for using MetaMatch!</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.log(err.message);
        return err.message;
    }
}

async function sendResetPasswordEmail(userEmail, username, newPassword) {
    try {

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: "Password Reset",
            html: `<h1>Password Reset</h1>
                   <p>Your password has been reset successfully. Here are your new credentials:</p>
                   <p><b>Email:</b> ${userEmail}</p>
                   <p><b>Password:</b> ${newPassword}</p>
                   <p>Please change your password after your first login for security reasons.</p>
                   <p>Thank you for using MetaMatch!</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (err) {
        console.log(err.message);
        return err.message;
    }
}

module.exports = { sendAccountCredentials, sendResetPasswordEmail };
