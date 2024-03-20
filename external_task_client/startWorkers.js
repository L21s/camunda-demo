import { Client, logger } from "camunda-external-task-client-js";
import { validateClaimData } from "./workers/validator.js";
import { createEmailHandler } from "./workers/notifier.js";
import { assessClaimRisk } from "./workers/riskAssesser.js";
import { validateDocument } from "./workers/documentValidator.js";
import axios from "axios";

const config = { baseUrl: "http://insurance-claim-demo:8080/engine-rest", use: logger };

const client = new Client(config);

const checkEngineStarted = async () => {
    try {
        await axios.get("http://insurance-claim-demo:8080/engine-rest/engine");
        return true;
    } catch (error) {
        return false;
    }
};

const startClient = async () => {
    const isEngineHealthy = await checkEngineStarted();
    if (isEngineHealthy) {
        console.log("Camunda engine has started. Subscribing to tasks...");
        client.subscribe("claimDataValidation", validateClaimData);
        client.subscribe("notification_claimInvalid", createEmailHandler("VALIDATION_ERROR"));
        client.subscribe("notification_claimRegistered", createEmailHandler("CLAIM_REGISTERED"));
        client.subscribe("notification_claimApproved", createEmailHandler("CLAIM_APPROVED"));
        client.subscribe("notification_claimRejected", createEmailHandler("CLAIM_REJECTED"));
        client.subscribe("riskAssessment", assessClaimRisk);
        client.subscribe("documentValidation", validateDocument);
    } else {
        console.log("Camunda engine has not started yet. Retrying in 5 seconds...");
        setTimeout(startClient, 5000);
    }
};

startClient();