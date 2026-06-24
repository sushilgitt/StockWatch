import nodemailer from "nodemailer";

// SMTP credentials come from environment variables so they never live in git.
// Set EMAIL_USER / EMAIL_PASS (and optionally EMAIL_HOST / EMAIL_PORT) in the
// deployment environment. Defaults target Gmail (STARTTLS on port 587).
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // must be false for STARTTLS on port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password (not the account password)
    },
    tls: {
        rejectUnauthorized: false, // helps with some hosting issues
    },
});

export default transporter;
