package org.l21s.insurance.camunda.delegates;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component
public class PaymentDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) {
        execution.getVariableNames().forEach(System.out::println);
        System.out.println("PaymentDelegate called");
        System.out.println("Payment successful");
    }
}
