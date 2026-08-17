# Event Ticketing System

A real-time backend for event ticketing, built to demonstrate advanced backend
engineering: distributed locking to prevent double-booking, live seat availability
over WebSockets, background job processing, and a fully automated test/CI pipeline.

## Highlights

- **Distributed seat locking** — seat reservations use Redis `SET NX EX` to guarantee
  that only one user can hold a given seat at a time, even under concurrent requests.
  Redis is single-threaded, so this eliminates the race condition entirely rather than
  just reducing its likelihood.
- **Ownership-aware locking** — a seat lock can only be released by the user who
  created it, verified by comparing the requester's ID against the value stored in
  the Redis lock itself.
- **Two-phase booking flow** — seats are locked temporarily (`POST /bookings/lock`)
  to give a user a reservation window, then confirmed (`POST /bookings/confirm`)
  inside a Prisma transaction that creates the booking and updates seat status
  atomically.
- **Real-time seat availability** — Socket.io broadcasts `seatLocked`, `seatBooked`,
  and `seatExpired` events to everyone viewing an event, so seat maps update live
  with no page refresh.
- **Automatic lock expiry** — a BullMQ background job runs shortly after a seat is
  locked; if the lock is still active (meaning it was never confirmed), it notifies
  all connected clients that the seat is available again.
- **Centralized error handling** — custom error classes (`NotFoundError`,
  `BadRequestError`, `UnauthorizedError`, `ForbiddenError`) flow through a single
  Express error-handling middleware.
- **Tested locking logic** — the locking and unlocking logic is covered by unit
  tests using Vitest with mocked Redis calls, isolating the business logic from
  the infrastructure.
- **Continuous Integration** — every push and pull request automatically runs the
  test suite via GitHub Actions.

## Tech Stack

| Layer           | Technology                          |
|------------------|--------------------------------------|
| Runtime          | Node.js, TypeScript                 |
| Framework        | Express                             |
| Database         | PostgreSQL                          |
| ORM              | Prisma                              |
| Cache / Locking  | Redis (`ioredis`)                   |
| Real-time        | Socket.io                           |
| Background Jobs  | BullMQ                              |
| Auth             | JWT, bcrypt                         |
| Validation       | Zod                                 |
| Testing          | Vitest                              |
| CI/CD            | GitHub Actions                      |
| Infrastructure   | Docker (Postgres + Redis)           |

## Architecture

```
src/
├── auth/            # Registration, login, JWT issuing
├── events/            # Event creation with auto-generated seats
├── booking/            # Seat locking, booking confirmation, Redis lock logic
├── workers/            # BullMQ worker for lock-expiry notifications
├── middleware/          # Auth, admin-role, and centralized error handling
├── shared/              # Custom error classes, shared helpers
├── config/               # Prisma client, Redis client, Socket.io, BullMQ queue
├── __tests__/             # Vitest unit tests
└── server.ts               # App entry point
```

## Data Model

```
User ──< Booking >── Seat >── Event
```

- An `Event` has many `Seat`s, auto-generated when the event is created.
- A `Seat` belongs to exactly one `Event` and has a status (`AVAILABLE`, `LOCKED`,
  `BOOKED`).
- A `Booking` links a `User` to a `Seat`; `seatId` is unique, so the database itself
  enforces that a seat can never be double-booked, as a safety net alongside the
  Redis lock.

## How the Booking Flow Works

Booking a seat happens in two steps, mirroring how real ticketing platforms (e.g.
concert or flight bookings) hold a seat while payment is completed:

1. **Lock** — `POST /bookings/lock` checks the seat is available in Postgres, then
   attempts `SET seat:{id}:lock <userId> EX 300 NX` in Redis. If the key already
   exists, the request fails immediately with no chance of a race condition,
   because Redis processes commands one at a time. All connected clients are
   notified via `seatLocked`. A background job is scheduled to check the seat again
   shortly after the lock's TTL expires.
2. **Confirm** — `POST /bookings/confirm` verifies the caller still holds the lock,
   then creates the `Booking` and updates the `Seat` status inside a single Prisma
   transaction — both succeed or both roll back together. The Redis lock is
   released and a `seatBooked` event is broadcast.

If the user never confirms, the Redis key expires on its own after 5 minutes, and
the background job broadcasts `seatExpired` so every connected client sees the
seat become available again without needing to retry.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [Docker](https://www.docker.com/)

### Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Ali-Salama7/event-ticketing-system.git
   cd event-ticketing-system
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your own values
   ```bash
   cp .env.example .env
   ```

4. Start PostgreSQL and Redis via Docker
   ```bash
   docker compose up -d
   ```

5. Run database migrations
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.

### Running Tests

```bash
npm test
```

Tests run automatically on every push and pull request via GitHub Actions.

## Authentication

Protected routes require a JWT sent in the `Authorization` header:

```
Authorization: Bearer <your_token_here>
```

A token is issued by `POST /auth/login` and is valid for 7 days. Admin-only routes
additionally require the authenticated user's role to be `ADMIN`.

## API Reference

### Auth

| Method | Endpoint         | Access | Description                  |
|--------|------------------|--------|-------------------------------|
| POST   | `/auth/register` | Public | Create a new user account     |
| POST   | `/auth/login`    | Public | Authenticate and receive a JWT |

### Events

| Method | Endpoint             | Access      | Description                                   |
|--------|----------------------|-------------|-------------------------------------------------|
| POST   | `/events`            | Admin only  | Create an event with an auto-generated seat map |
| GET    | `/events`            | Public      | List all events                                 |
| GET    | `/events/:id/seats`  | Public      | List all seats for an event, in seat order      |

### Bookings

| Method | Endpoint            | Access         | Description                                  |
|--------|----------------------|----------------|-------------------------------------------------|
| POST   | `/bookings/lock`     | Authenticated  | Temporarily lock a seat for the current user     |
| POST   | `/bookings/confirm`  | Authenticated  | Confirm a booking for a seat the user has locked |

#### Example — Locking then confirming a seat

```http
POST /bookings/lock
Authorization: Bearer <token>
Content-Type: application/json

{ "seatId": 12 }
```

```http
POST /bookings/confirm
Authorization: Bearer <token>
Content-Type: application/json

{ "seatId": 12 }
```

### Real-time Events (Socket.io)

Clients join an event's room to receive live seat updates:

```js
const socket = io("http://localhost:3000");
socket.emit("joinEvent", eventId);

socket.on("seatLocked", ({ seatId, lockedBy }) => { /* ... */ });
socket.on("seatBooked", ({ seatId, bookedBy }) => { /* ... */ });
socket.on("seatExpired", ({ seatId }) => { /* ... */ });
```

## Error Handling

All errors are returned in a consistent shape:

```json
{ "error": "This seat is locked by another user" }
```

| Status | Meaning                                      |
|--------|------------------------------------------------|
| 400    | Invalid request data                           |
| 401    | Missing or invalid authentication token         |
| 403    | Authenticated but not authorized                |
| 404    | Resource not found                              |
| 500    | Unexpected server error                         |

## License

ISC