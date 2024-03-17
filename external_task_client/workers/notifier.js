import nodemailer from "nodemailer";

// CONFIGURE YOUR EMAIL SETTINGS HERE
const emailConfig = {
    service: "",
    host: "",
    port: 123,
    secure: true,
    auth: {
        user: "",
        pass: "",
    }
}

const transporter = nodemailer.createTransport(emailConfig);

function createEmailHandler(messageType) {
    return async function ({task, taskService}) {
        console.log("Sending notification", messageType.toLocaleLowerCase().replace("_", " "))
        const to = task.variables.get("email");
        const subject = messageTypeToSubject(messageType);
        const body = generateEmailBody(messageType, task.variables.get("fullName"));
        // CONFIGURE YOUR EMAIL SETTINGS HERE
        await transporter.sendMail({
            from: "",
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