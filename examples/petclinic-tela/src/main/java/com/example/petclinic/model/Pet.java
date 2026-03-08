package com.example.petclinic.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "pets")
public class Pet {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String name;
    private String birthDate;
    private String type;
    private Long ownerId;

    public Pet() {}
    public Pet(Long id, String name, String birthDate, String type, Long ownerId) {
        this.id = id; this.name = name; this.birthDate = birthDate;
        this.type = type; this.ownerId = ownerId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getBirthDate() { return birthDate; }
    public void setBirthDate(String v) { this.birthDate = v; }
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long v) { this.ownerId = v; }
}
