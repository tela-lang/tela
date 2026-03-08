package com.example.petclinic.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "vets")
public class Vet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String specialties;

    public Vet() {}
    public Vet(Long id, String firstName, String lastName, String specialties) {
        this.id = id; this.firstName = firstName;
        this.lastName = lastName; this.specialties = specialties;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String v) { this.firstName = v; }
    public String getLastName() { return lastName; }
    public void setLastName(String v) { this.lastName = v; }
    public String getSpecialties() { return specialties; }
    public void setSpecialties(String v) { this.specialties = v; }
}
