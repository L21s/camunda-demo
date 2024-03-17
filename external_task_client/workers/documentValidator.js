import { Variables } from "camunda-external-task-client-js";

async function validateDocument({task, taskService}) {
    const claimDocument = task.variables.get("claimDocument");
    if (claimDocument.mimeType === 'application/pdf') {
        console.log("Uploaded document is valid")
        const variables = new Variables().set("documentValid", true);
        await taskService.complete(task, variables);
        return;
    }
    console.log("Uploaded document is not valid")
    const variables = new Variables().set("documentValid", false);
    await taskService.complete(task, variables);
}

export { validateDocument };