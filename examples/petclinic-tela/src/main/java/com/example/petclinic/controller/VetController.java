package com.example.petclinic.controller;

import com.example.petclinic.model.Vet;
import com.example.petclinic.repository.VetRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
@CrossOrigin
public class VetController {

    private final VetRepository vets;

    public VetController(VetRepository vets) {
        this.vets = vets;
    }

    @GetMapping
    public List<Vet> list() {
        return vets.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vet> get(@PathVariable Long id) {
        return vets.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Vet create(@Valid @RequestBody Vet vet) {
        vet.setId(null);
        return vets.save(vet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vet> update(@PathVariable Long id, @Valid @RequestBody Vet vet) {
        if (!vets.existsById(id)) return ResponseEntity.notFound().build();
        vet.setId(id);
        return ResponseEntity.ok(vets.save(vet));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!vets.existsById(id)) return ResponseEntity.notFound().build();
        vets.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
