"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTP = sendOTP;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
async function sendOTP(email, otp) {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: config_1.default.GMAIL_USER,
            pass: config_1.default.GMAIL_APP_PASSWORD
        }
    });
    const mailOptions = {
        from: `"Gerado" <${config_1.default.GMAIL_USER}>`,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP is: ${otp}`,
        html: `<p>Your <strong>OTP</strong> is: <b>${otp}</b></p>`
    };
    await transporter.sendMail(mailOptions);
}
//# sourceMappingURL=mailer.js.map