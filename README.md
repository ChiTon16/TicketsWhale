TicketsWhale

TicketsWhale is a **microservices-based football ticket booking platform** built with Spring Boot. The system supports user authentication, Premier League match synchronization, ticket booking, VNPay payments, QR tickets, email notifications, football news, and AI-generated match previews.

**Live Website:** https://tickets-whale.vercel.app/

---

Backend Architecture

The backend follows a **Microservices Architecture**, consisting of four main services:

```text
                         ┌─────────────────┐
                         │    Frontend     │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   API Gateway   │
                         │      :8080      │
                         └───────┬─────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
          ┌─────────────────┐         ┌─────────────────┐
          │ Identity Service│         │Ticketing Service│
          │      :8081      │         │      :8082      │
          └────────┬────────┘         └───────┬─────────┘
                   │                          │
              PostgreSQL              PostgreSQL + Redis
                                              │
                                           RabbitMQ
                                              │
                                              ▼
                                    ┌────────────────────┐
                                    │Notification Service│
                                    │       :8083        │
                                    └─────────┬──────────┘
                                              │
                                           Email + QR
```

### API Gateway

Acts as the single entry point for the frontend.

* Routes requests to the appropriate microservice
* Validates JWT access tokens
* Forwards authenticated user information to downstream services

### Identity Service

Handles authentication and user identity.

* Registration & login
* JWT authentication
* Refresh token rotation
* BCrypt password hashing
* User roles
* PostgreSQL persistence

### Ticketing Service

Contains the core business logic of the platform.

* Premier League matches
* Stadiums and seating sections
* Ticket booking
* Booking expiration
* VNPay payment
* QR tickets
* Football news
* AI match previews

Ticket inventory uses **pessimistic database locking** to reduce the risk of overselling when multiple users book tickets concurrently.

Unpaid bookings are automatically expired after **10 minutes**, releasing the reserved seats.

### Notification Service

Handles asynchronous notifications.

Ticketing Service publishes booking events through **RabbitMQ**, allowing Notification Service to process emails independently from the main booking request.

```text
Ticketing Service
       │
       ▼
    RabbitMQ
       │
       ▼
Notification Service
       │
       ├── HTML Email
       └── QR Ticket
```

---

##  Backend Tech Stack

| Category       | Technology                                |
| -------------- | ----------------------------------------- |
| Backend        | Java, Spring Boot                         |
| Architecture   | Microservices                             |
| API Gateway    | Spring Cloud Gateway                      |
| Security       | Spring Security, JWT, BCrypt              |
| Database       | PostgreSQL, Spring Data JPA, Hibernate    |
| Cache          | Redis                                     |
| Message Broker | RabbitMQ                                  |
| Payment        | VNPay                                     |
| QR Code        | ZXing                                     |
| Email          | Spring Mail                               |
| External Data  | Football-Data.org, NewsAPI, Wikipedia API |
| AI             | Groq API                                  |
| Infrastructure | Docker, Docker Compose                    |
| Build Tool     | Maven                                     |

---

## How the Backend Works

A typical booking request follows this flow:

```text
1. User logs in
        │
        ▼
2. Identity Service issues JWT
        │
        ▼
3. Frontend sends request with JWT
        │
        ▼
4. API Gateway validates JWT
        │
        ▼
5. Ticketing Service processes booking
        │
        ├── Validate match
        ├── Lock ticket inventory
        ├── Reserve seats
        └── Create booking
        │
        ▼
6. User pays through VNPay
        │
        ▼
7. Booking is confirmed
        │
        ▼
8. RabbitMQ publishes booking event
        │
        ▼
9. Notification Service sends
   confirmation email + QR ticket
```

Redis is used to cache external data such as football news, stadium information, and AI match summaries, reducing unnecessary calls to third-party APIs.

Match information is periodically synchronized from **Football-Data.org**, while scheduled backend jobs also handle match updates and expired bookings.

---

## Backend Structure

```text
Backend/TicketWhale/
│
├── api-gateway/
│
├── identity-service/
│
├── ticketing-service/
│
├── notification-service/
│
├── docker-compose.yml
├── init-db.sql
└── pom.xml
```

---

 Running the Backend

Clone the repository:

```bash
git clone https://github.com/ChiTon16/TicketsWhale.git
cd TicketsWhale/Backend/TicketWhale
```

Configure the required environment variables, then start all services:

```bash
docker compose up --build
```

Main services:

```text
API Gateway          http://localhost:8080
Identity Service     http://localhost:8081
Ticketing Service    http://localhost:8082
Notification Service http://localhost:8083
RabbitMQ Management  http://localhost:15672
```

Stop the system:

```bash
docker compose down
```
