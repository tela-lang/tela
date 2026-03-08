package com.example.petclinic.controller;

import com.example.petclinic.model.Pet;
import com.example.petclinic.model.Visit;
import com.example.petclinic.repository.PetRepository;
import com.example.petclinic.repository.VisitRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin
public class PetController {

    private final PetRepository pets;
    private final VisitRepository visits;

    public PetController(PetRepository pets, VisitRepository visits) {
        this.pets = pets;
        this.visits = visits;
    }

    @GetMapping
    public List<Pet> list() {
        return pets.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pet> get(@PathVariable Long id) {
        return pets.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pet create(@Valid @RequestBody Pet pet) {
        pet.setId(null);
        return pets.save(pet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pet> update(@PathVariable Long id, @Valid @RequestBody Pet pet) {
        if (!pets.existsById(id)) return ResponseEntity.notFound().build();
        pet.setId(id);
        return ResponseEntity.ok(pets.save(pet));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!pets.existsById(id)) return ResponseEntity.notFound().build();
        visits.findByPetId(id).forEach(v -> visits.deleteById(v.getId()));
        pets.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/visits")
    public ResponseEntity<List<Visit>> getVisits(@PathVariable Long id) {
        if (!pets.existsById(id)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(visits.findByPetId(id));
    }
}
