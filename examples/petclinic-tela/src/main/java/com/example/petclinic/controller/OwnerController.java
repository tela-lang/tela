package com.example.petclinic.controller;

import com.example.petclinic.model.Owner;
import com.example.petclinic.model.Pet;
import com.example.petclinic.repository.OwnerRepository;
import com.example.petclinic.repository.PetRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owners")
@CrossOrigin
public class OwnerController {

    private final OwnerRepository owners;
    private final PetRepository pets;

    public OwnerController(OwnerRepository owners, PetRepository pets) {
        this.owners = owners;
        this.pets = pets;
    }

    @GetMapping
    public List<Owner> list(@RequestParam(required = false) String lastName) {
        if (lastName != null && !lastName.isBlank()) {
            return owners.findByLastNameContainingIgnoreCase(lastName);
        }
        return owners.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Owner> get(@PathVariable Long id) {
        return owners.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Owner create(@Valid @RequestBody Owner owner) {
        owner.setId(null);
        return owners.save(owner);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Owner> update(@PathVariable Long id, @Valid @RequestBody Owner owner) {
        if (!owners.existsById(id)) return ResponseEntity.notFound().build();
        owner.setId(id);
        return ResponseEntity.ok(owners.save(owner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!owners.existsById(id)) return ResponseEntity.notFound().build();
        pets.findByOwnerId(id).forEach(p -> pets.deleteById(p.getId()));
        owners.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pets")
    public ResponseEntity<List<Pet>> getPets(@PathVariable Long id) {
        if (!owners.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(pets.findByOwnerId(id));
    }
}
