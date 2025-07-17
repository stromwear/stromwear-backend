import nodemailer from 'nodemailer';
import config from '../config';
export async function sendOTP(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.GMAIL_USER,  
      pass: config.GMAIL_APP_PASSWORD   
    }
  });
  const mailOptions = {
    from: `"StromWear" <${config.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP for regitering is: ${otp}`,
    html: `<p>Your <strong>OTP for registering</strong> is: <b>${otp}</b></p> ignore if not done by you <br/> <h4 style='color:red;'>Nerver share your OTP to anyone</h4>`
  };
  await transporter.sendMail(mailOptions);
}
