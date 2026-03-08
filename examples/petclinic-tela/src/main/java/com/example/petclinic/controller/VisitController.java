package com.example.petclinic.controller;

import com.example.petclinic.model.Visit;
import com.example.petclinic.repository.VisitRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin
public class VisitController {

    private final VisitRepository visits;

    public VisitController(VisitRepository visits) {
        this.visits = visits;
    }

    @GetMapping
    public List<Visit> list() {
        return visits.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Visit> get(@PathVariable Long id) {
        return visits.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Visit create(@Valid @RequestBody Visit visit) {
        visit.setId(null);
        return visits.save(visit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Visit> update(@PathVariable Long id, @Valid @RequestBody Visit visit) {
        if (!visits.existsById(id)) return ResponseEntity.notFound().build();
        visit.setId(id);
        return ResponseEntity.ok(visits.save(visit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!visits.existsById(id)) return ResponseEntity.notFound().build();
        visits.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
