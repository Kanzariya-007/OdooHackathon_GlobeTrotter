# GlobeTrotter Hackathon — Member 3 Task

## Role

Backend Developer + PostgreSQL + Prisma

---

## Main Responsibility

You are responsible for:

1. PostgreSQL
2. Prisma ORM
3. Database schema
4. Relationships
5. REST APIs
6. Validation
7. Seed data

---

# 1. Database

Use:

PostgreSQL + Prisma

DO NOT use MongoDB.

The application must demonstrate proper relational database usage.

---

# 2. Main Tables

Create:

users

trips

cities

trip_stops

activities

stop_activities

expenses

---

# 3. Relationships

Users:

User 1
   ↓
Many Trips

Trip:

Trip 1
   ↓
Many Trip Stops

Trip Stop:

Trip Stop
   ↓
City

City:

City 1
   ↓
Many Activities

Trip Stop:

Trip Stop
   ↓
Many Stop Activities

Trip:

Trip 1
   ↓
Many Expenses

---

# 4. Prisma Models

Implement appropriate Prisma models for:

User
Trip
City
TripStop
Activity
StopActivity
Expense

Use:

- Primary keys
- Foreign keys
- Relationships
- Required fields
- Optional fields
- Appropriate indexes where useful

---

# 5. Trip APIs

Implement:

POST /api/trips

GET /api/trips

GET /api/trips/:id

PUT /api/trips/:id

DELETE /api/trips/:id

Only authenticated users should access their own trips.

---

# 6. City APIs

Implement:

GET /api/cities

Support:

- Search
- Country filter
- Cost index
- Popularity

Example:

GET /api/cities?search=Paris

---

# 7. Activity APIs

Implement:

GET /api/activities

Support:

- Search
- Category
- Cost
- Duration

Example:

GET /api/activities?cityId=1

---

# 8. Trip Stop APIs

Implement:

POST /api/trips/:tripId/stops

GET /api/trips/:tripId/stops

PUT /api/stops/:id

DELETE /api/stops/:id

---

# 9. Activity Scheduling APIs

Implement:

POST /api/stops/:stopId/activities

PUT /api/stop-activities/:id

DELETE /api/stop-activities/:id

Fields should support:

- Activity
- Date
- Start time
- End time
- Cost
- Order

---

# 10. Budget APIs

Implement functionality to calculate:

- Transport
- Accommodation
- Activities
- Food
- Other
- Total

Example:

GET /api/trips/:id/budget

Return:

{
    total,
    transport,
    accommodation,
    activities,
    food,
    other
}

---

# 11. Timeline API

Create:

GET /api/trips/:id/timeline

Return itinerary data grouped by date.

---

# 12. Public Sharing

Implement:

POST /api/trips/:id/share

Generate a unique share token.

Public API:

GET /api/public/trips/:token

The public endpoint must NOT require login.

---

# 13. Seed Data

Create useful sample data.

Cities:

- Paris
- London
- Tokyo
- Dubai
- Mumbai
- Delhi
- Ahmedabad
- Singapore
- Rome
- Amsterdam
- Barcelona
- New York

Activities:

- Eiffel Tower
- Louvre Museum
- Canal Tour
- Museum
- City Tour
- Temple Visit
- Beach Visit
- etc.

Each city should have:

- Name
- Country
- Region
- Cost index
- Popularity
- Description

Activities should have:

- Name
- Category
- Duration
- Estimated cost
- City

---

# 14. Validation

Validate:

- Required fields
- Dates
- IDs
- Numeric values
- Duplicate email
- Invalid trip ownership
- Invalid city/activity

Return clear HTTP status codes.

---

# 15. API Testing

Test APIs using Postman.

Test:

- Register
- Login
- Create Trip
- Get Trips
- Get Trip
- Update Trip
- Delete Trip
- Search Cities
- Search Activities
- Add Stop
- Add Activity
- Budget
- Timeline
- Public Sharing

---

# 16. GitHub

Before starting:

git pull origin main

Commit frequently.

Examples:

feat: create prisma database schema

feat: implement trip APIs

feat: add city search API

feat: add activity API

feat: implement itinerary APIs

feat: implement budget calculation

feat: implement public trip sharing

Push:

git push origin main

---

# Priority

P0:
- PostgreSQL
- Prisma schema
- Authentication APIs
- Trip APIs
- City APIs
- Activity APIs

P1:
- Itinerary APIs
- Budget
- Timeline

P2:
- Advanced filtering
- Extra analytics

---

# Expected Result

The backend must provide a stable API for:

Authentication
Trips
Cities
Activities
Itinerary
Budget
Timeline
Public Sharing

Postman should be able to demonstrate that the APIs work independently.