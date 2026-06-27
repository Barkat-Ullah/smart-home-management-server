import { Job, Worker } from "bullmq";
import emailSender from "../emailSender/emailSender";
import { sendSmsOtp } from "../phoneSmsSender/messageSender";
import { createWorker } from "./workerFactory";

const otpEmail = (otpCode: string) => `<h1>Your OTP Code</h1><p>${otpCode}</p>`;

export const otpWorker: Worker = createWorker("otp-queue", async (job: Job) => {
  const { otpCode, identifier, type = "email" } = job.data;
  if (type === "email") {
    const otpHtml = otpEmail(otpCode);
    await emailSender("OTP Verification", identifier, otpHtml);
    console.log(`✅ OTP email sent to ${identifier}`);
  } else if (type === "sms") {
    await sendSmsOtp(identifier, otpCode);
    console.log(`✅ OTP SMS sent to ${identifier}`);
  }
  return { success: true, type, identifier };
});
