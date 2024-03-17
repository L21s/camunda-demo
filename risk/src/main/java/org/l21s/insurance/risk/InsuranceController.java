package org.l21s.insurance.risk;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Random;

@RestController
@RequestMapping("/insurance")
public class InsuranceController {

    @GetMapping("/assessClaimRisk")
    public int assessClaimRisk() {
        return generateRandomNumber();
    }

    private int generateRandomNumber() {
        Random random = new Random();
        return random.nextInt((90 - 10) + 1) + 10;
    }
}
