package com.example.petclinic;

import com.example.petclinic.model.*;
import com.example.petclinic.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final OwnerRepository owners;
    private final PetRepository pets;
    private final VetRepository vets;
    private final VisitRepository visits;

    public DataSeeder(OwnerRepository owners, PetRepository pets,
                      VetRepository vets, VisitRepository visits) {
        this.owners = owners;
        this.pets = pets;
        this.vets = vets;
        this.visits = visits;
    }

    @Override
    public void run(String... args) {
        // Owners
        Owner george = owners.save(new Owner(null, "George", "Franklin", "110 W. Liberty St.", "Madison", "6085551023"));
        Owner betty  = owners.save(new Owner(null, "Betty",  "Davis",    "638 Cardinal Ave.",  "Sun Prairie", "6085551749"));
        Owner harold = owners.save(new Owner(null, "Harold", "Davis",    "563 Friendly St.",   "Windsor", "6085558749"));
        Owner peter  = owners.save(new Owner(null, "Peter",  "McTavish", "2387 S. Fair Way",   "Madison", "6085552765"));
        Owner jean   = owners.save(new Owner(null, "Jean",   "Coleman",  "105 N. Lake St.",    "Monona", "6085552654"));

        // Pets
        Pet leo      = pets.save(new Pet(null, "Leo",      "2010-09-07", "cat",    george.getId()));
        Pet basil    = pets.save(new Pet(null, "Basil",    "2012-08-06", "hamster", betty.getId()));
        Pet rosy     = pets.save(new Pet(null, "Rosy",     "2011-04-17", "dog",    harold.getId()));
        Pet jewel    = pets.save(new Pet(null, "Jewel",    "2010-03-07", "dog",    harold.getId()));
        Pet iggy     = pets.save(new Pet(null, "Iggy",     "2010-11-30", "lizard", peter.getId()));
        Pet george2  = pets.save(new Pet(null, "George",   "2010-01-20", "snake",  peter.getId()));
        Pet samantha = pets.save(new Pet(null, "Samantha",  "2012-09-04", "cat",    jean.getId()));
        Pet max      = pets.save(new Pet(null, "Max",      "2012-09-04", "cat",    jean.getId()));

        // Vets
        vets.save(new Vet(null, "James",  "Carter",    ""));
        vets.save(new Vet(null, "Helen",  "Leary",     "radiology"));
        vets.save(new Vet(null, "Linda",  "Douglas",   "dentistry, surgery"));
        vets.save(new Vet(null, "Rafael", "Ortega",    "surgery"));
        vets.save(new Vet(null, "Henry",  "Stevens",   "radiology"));
        vets.save(new Vet(null, "Sharon", "Jenkins",   ""));

        // Visits
        visits.save(new Visit(null, samantha.getId(), "2023-01-01", "Rabies shot"));
        visits.save(new Visit(null, samantha.getId(), "2023-03-04", "Neutered"));
        visits.save(new Visit(null, max.getId(),      "2023-01-02", "Rabies shot"));
        visits.save(new Visit(null, leo.getId(),      "2023-06-15", "Annual checkup"));
        visits.save(new Visit(null, basil.getId(),    "2023-08-20", "Vaccination"));
        visits.save(new Visit(null, rosy.getId(),     "2023-09-10", "Dental cleaning"));
    }
}
