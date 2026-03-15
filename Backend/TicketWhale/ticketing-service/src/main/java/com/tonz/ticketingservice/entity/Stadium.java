package com.tonz.ticketingservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stadiums")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stadium {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    private int totalCapacity;

    @OneToMany(mappedBy = "stadium", cascade = CascadeType.ALL)
    private List<Match> matches;
}