
package com.example.adyen;

import com.adyen.Client;
import com.adyen.enums.Environment;
import com.adyen.model.checkout.CreateCheckoutSessionRequest;
import com.adyen.model.checkout.CreateCheckoutSessionResponse;
import com.adyen.service.checkout.Sessions;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SessionController {

  @PostMapping("/sessions")
  public CreateCheckoutSessionResponse createSession() throws Exception {
    Client client = new Client(System.getenv("ADYEN_API_KEY"), Environment.TEST);
    client.setApplicationName("Render ApplePay Demo");

    CreateCheckoutSessionRequest req = new CreateCheckoutSessionRequest();
    req.setMerchantAccount(System.getenv("ADYEN_MERCHANT_ACCOUNT"));
    req.setAmount(new com.adyen.model.checkout.Amount().currency("USD").value(1000L));
    req.setCountryCode("US");
    req.setReference("render-applepay-demo");
    req.setReturnUrl(System.getenv("BASE_URL") + "/");

    Sessions sessions = new Sessions(client);
    return sessions.createSession(req);
  }
}
