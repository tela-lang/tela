package com.example.petclinic.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "visits")
public class Visit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long petId;
    @NotBlank private String visitDate;
    @NotBlank private String description;

    public Visit() {}
    public Visit(Long id, Long petId, String visitDate, String description) {
        this.id = id; this.petId = petId;
        this.visitDate = visitDate; this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPetId() { return petId; }
    public void setPetId(Long v) { this.petId = v; }
    public String getVisitDate() { return visitDate; }
    public void setVisitDate(String v) { this.visitDate = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
}
