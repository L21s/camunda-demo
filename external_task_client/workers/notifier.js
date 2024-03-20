import nodemailer from "nodemailer";
import fs from "fs/promises";
import yaml from "js-yaml";

const loadEmailConfig = async () => {
    console.log("Loading email configuration");

    const requiredFields = ["host", "port", "secure", "auth"];
    const data = await fs.readFile("emailConfig.yaml", "utf8");
    const config = yaml.load(data);

    if (!requiredFields.every(field => config[field])) {
        throw new Error("Email configuration is missing required fields");
    }

    return config;
}

const emailConfig = await loadEmailConfig();

const transporter = nodemailer.createTransport(emailConfig);

function createEmailHandler(messageType) {
    return async function ({task, taskService}) {
        console.log("Sending notification", messageType.toLocaleLowerCase().replace("_", " "))

        const to = task.variables.get("email");
        const subject = messageTypeToSubject(messageType);
        const body = generateEmailBody(messageType, task.variables.get("fullName"));

        await transporter.sendMail({
            from: emailConfig.auth.user,
            to,
            subject,
            text: body,
        });

        await taskService.complete(task);
    };
}

function messageTypeToSubject(messageType) {
    switch (messageType) {
        case "VALIDATION_ERROR":
            return "Claim Data Invalid";
        case "CLAIM_REGISTERED":
            return "Claim Successfully Registered";
        case "CLAIM_APPROVED":
            return "Claim Approved";
        case "CLAIM_REJECTED":
            return "Claim Rejected"
    }
}

function generateEmailBody(messageType, name) {
    switch (messageType) {
        case "VALIDATION_ERROR":
            return `Hello ${name}, your claim data is invalid`;
        case "CLAIM_REGISTERED":
            return `Hello ${name}, your claim was successfully registered`;
        case "CLAIM_APPROVED":
            return `Hello ${name}, your claim is approved`;
        case "CLAIM_REJECTED":
            return `Hello ${name}, your claim was rejected`
    }
}

export {createEmailHandler};