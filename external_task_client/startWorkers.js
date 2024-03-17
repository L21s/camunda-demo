import { Client, logger } from "camunda-external-task-client-js";
import { validateClaimData } from "./workers/validator.js";
import { createEmailHandler } from "./workers/notifier.js";
import { assessClaimRisk } from "./workers/riskAssesser.js";
import { validateDocument } from "./workers/documentValidator.js";

const config = { baseUrl: "http://insurance-claim-demo:8080/engine-rest", use: logger };

const client = new Client(config);

client.subscribe("claimDataValidation", validateClaimData);
client.subscribe("notification_claimInvalid", createEmailHandler("VALIDATION_ERROR"));
client.subscribe("notification_claimRegistered", createEmailHandler("CLAIM_REGISTERED"));
client.subscribe("notification_claimApproved", createEmailHandler("CLAIM_APPROVED"));
client.subscribe("notification_claimRejected", createEmailHandler("CLAIM_REJECTED"));
client.subscribe("riskAssessment", assessClaimRisk);
client.subscribe("documentValidation", validateDocument);