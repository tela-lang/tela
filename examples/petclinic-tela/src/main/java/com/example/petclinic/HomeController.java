package com.example.petclinic;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

  // Serve index.html for the root and all SPA client-side routes
  // (excludes /api/** which is handled by REST controllers,
  //  and static assets which are handled by Spring's resource handler)
  @GetMapping({"/", "/owners", "/pets", "/vets", "/visits"})
  public String index() {
    return "index";
  }
}
