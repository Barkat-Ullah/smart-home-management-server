import { Job, Worker } from "bullmq";
import emailSender from "../emailSender/emailSender";
import { createWorker } from "./workerFactory";

const inviteStudentEmail = (info: { studentEmail: string; className: string; schoolName: string }) => {
  return `<h1>Welcome to ${info.className} at ${info.schoolName}</h1><p>Dear Student, you have been invited.</p>`;
};

export const emailWorker: Worker = createWorker(
  "mail-queue",
  async (job: Job) => {
    const { information, type = "email" } = job.data;

    const otpHtml = inviteStudentEmail(information);
    await emailSender(
      `You're Invited to Join ${information.className} at ${information.schoolName}`,
      information.studentEmail,
      otpHtml
    );
    console.log(`✅ Class invitation sent to ${information.studentEmail}`);

    return { success: true, type, identifier: information.studentEmail };
  }
);
