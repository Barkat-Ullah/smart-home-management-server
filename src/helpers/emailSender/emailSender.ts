import * as nodemailer from "nodemailer";
import config from "../../config";
import ApiError from "../../app/errors/AppError";


const emailSender = async (subject: string, email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.mail,
      pass: config.mail_password,
    },
  });

  const emailTransport = transporter;

  const mailOptions = {
    from: `"rakib" <${config.mail}>`,
    to: email,
    subject,
    html,
  };

  // Send the email
  try {
    const info = await emailTransport.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Error sending email");
  }
};

export default emailSender;
