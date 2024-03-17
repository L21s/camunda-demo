import axios from "axios";
import { Variables } from "camunda-external-task-client-js";

async function assessClaimRisk({task, taskService}) {
    console.log("Assessing risk")

    const response = await sendRestRequest();
    const risk = response.data;
    const variables = new Variables().set("risk", risk);
    console.log("risk = ", risk)
    await taskService.complete(task, variables);
}

function sendRestRequest() {
    return axios.get("http://risk:8090/insurance/assessClaimRisk");
}

export { assessClaimRisk };
