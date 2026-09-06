/*const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, name, token) => {
    const verifylink = `http://localhost:3001/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `shopmate <${process.env.MAIL_USERNAME}>`,
        to: email,
        subject: "Email Verification",
        html: `
            <h2>Welcome ${name},</h2>
            <p>Please click the link below to verify your email:</p>
            <a href="${verifylink}" >Verify Email</a>
        `
    });
};  

const sendEmail = async ({to, subject, text, html}) => {
    await transporter.sendMail({
        from: `shopmate <${process.env.MAIL_USERNAME}>`,    
        to,
        subject,
        text,
        html
    });
};

module.exports = { sendVerificationEmail, sendEmail };
*/
/*
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, name, token) => {
    const verifyLink = `http://localhost:3001/api/users/verify-email/${token}`;

    const info = await transporter.sendMail({
        from: `ShopMATE <${process.env.MAIL_USERNAME}>`,
        to: email,
        subject: "Verify Your Email",
        html: `
            <h2>Welcome ${name}</h2>
            <p>Please click the button below to verify your account.</p>

            <a href="${verifyLink}"
               style="
                    background:#000;
                    color:#fff;
                    padding:10px 20px;
                    text-decoration:none;
                    border-radius:5px;
               ">
               Verify Email
            </a>

            <p>If you did not create this account, please ignore this email.</p>
        `
    });

    console.log("Verification email sent:", info.messageId);
};

const sendEmail = async ({ to, subject, text, html }) => {
    await transporter.sendMail({
        from: `ShopMATE <${process.env.MAIL_USERNAME}>`,
        to,
        subject,
        text,
        html
    });
};

module.exports = {
    sendVerificationEmail,
    sendEmail
};


*/



const transporter = require('nodemailer').createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.Mail_UserName,
        pass: process.env.Mail_Password
    }
});
transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP ERROR:", error);
    } else {
        console.log("SMTP SERVER READY");
    }
});

const sendverificationEmail = async (email,name,token) => {
    const verifyLink = `http://localhost:3001/api/users/verify-email/${token}`;
    await transporter.sendMail({
        from: process.env.Mail_UserName,
        to: email,
        subject: 'Verify your email',
        html: `<h2>Hi ${name},</h2>
               <p>Please click the following link to verify your email:</p>
               <a href="${verifyLink}">${verifyLink}</a>`
    });
};
const sendEmail = async ({to, subject, html, text}) => {
    await transporter.sendMail({
        from: `"ShopMate" <${process.env.Mail_UserName}>`,
        to ,
        subject,
        html 
    });
};

console.log("MAIL_USERNAME:", process.env.MAIL_USERNAME);
console.log("MAIL_PASSWORD exists:", !!process.env.MAIL_PASSWORD);
module.exports = { sendverificationEmail, sendEmail };