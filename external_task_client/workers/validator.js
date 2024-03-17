import {Variables} from "camunda-external-task-client-js";

async function validateClaimData({ task, taskService }) {
    console.log("Validating data")

    const claimData = task.variables.get("claimData");
    const variables = mapData(claimData);

    if (!validateInsuranceClaim(claimData)) {
        await taskService.handleBpmnError(task, 2, "Validation Error", variables);
        return;
    }

    await taskService.complete(task, variables);
}

function mapData(data) {
    console.log("Mapping data to camunda variables")

    const variables = new Variables();
    variables.setAll({
        fullName: data.policyHolder.fullName,
        dob: data.policyHolder.dob,
        address: data.policyHolder.address,
        contactNumber: data.policyHolder.contactNumber,
        email: data.policyHolder.email,
        incidentDate: data.incident.date,
        location: data.incident.location,
        incidentDescription: data.incident.description,
        estimatedCost: data.damageDetails.estimatedCost,
        damageDescription: data.damageDetails.description,
        photoUrls: data.damageDetails.photos
    });
    return variables;
}

function validateInsuranceClaim(claimData) {
    const requiredFields = ["policyHolder", "incident", "damageDetails"];
    for (const field of requiredFields) {
        if (!claimData[field]) {
            console.log(`Validation failed: ${field} is missing.`);
            return false;
        }
    }

    const { policyHolder } = claimData;
    if (policyHolder) {
        const policyHolderFields = ["fullName", "dob", "address", "contactNumber", "email"];
        for (const subfield of policyHolderFields) {
            if (!policyHolder[subfield]) {
                console.log(`Validation failed: policyHolder.${subfield} is missing.`);
                return false;
            }
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (policyHolder.email && !emailRegex.test(policyHolder.email)) {
            console.log("Validation failed: Invalid email format in policyHolder.");
            return false;
        }
    }

    // Additional validations

    return true;
}

export { validateClaimData };