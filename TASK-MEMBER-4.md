# GlobeTrotter Hackathon — Member 4 Task

## Role

Core Feature Developer — Itinerary + Budget + Timeline + Sharing

---

## Main Responsibility

Build the core travel-planning experience.

Main modules:

1. City discovery
2. Activity discovery
3. Itinerary builder
4. Activity scheduling
5. Timeline
6. Budget dashboard
7. Public sharing
8. Copy Trip

---

# 1. City Discovery

Create a city search interface.

Show:

- City name
- Country
- Region
- Cost index
- Popularity
- Image
- Description

Search:

Search cities by name.

Filters:

- Country
- Cost
- Popularity

Action:

[Add to Trip]

---

# 2. Activity Discovery

Create activity search.

Show:

- Activity name
- Category
- Duration
- Estimated cost
- Description

Filters:

- Category
- Cost
- Duration

Action:

[Add Activity]

---

# 3. Itinerary Builder

This is the main feature.

User should be able to:

- Add cities
- Set city dates
- Add activities
- Schedule activities
- Set start time
- Set end time
- Set cost
- Remove activities
- Change order

Example:

Day 1 — Paris

10:00 Eiffel Tower
14:00 Louvre Museum
19:00 Dinner

Day 2 — Amsterdam

09:00 Canal Tour
15:00 Museum

---

# 4. Multi-City Planning

Support:

Paris
↓
Amsterdam
↓
Rome

Each stop should have:

- City
- Start date
- End date
- Order

The itinerary should clearly show the travel sequence.

---

# 5. Timeline

Create a vertical timeline.

Example:

September 10

Paris

10:00
Eiffel Tower

14:00
Louvre Museum

19:00
Dinner

September 11

Paris

09:00
Versailles

---

# 6. Budget Dashboard

Show:

Total Cost

Transport

Accommodation

Activities

Food

Other

---

# 7. Budget Chart

Use Recharts.

Create a chart such as:

Pie Chart / Donut Chart

Example:

Transport 25%
Accommodation 35%
Activities 20%
Food 10%
Other 10%

---

# 8. Budget Analytics

Show:

Total trip cost

Average daily cost

Category breakdown

Budget status

Example:

₹82,500

Average/day:
₹8,250

Status:
Within Budget

If budget exceeds configured target:

Show:

⚠️ Over Budget

---

# 9. Public Sharing

Create:

[Share Trip]

Generate a public link.

Example:

/share/abc123

Public page should display:

- Trip name
- Dates
- Cities
- Activities
- Timeline
- Budget summary

No login should be required.

---

# 10. Copy Trip

On the public trip page:

[Copy This Trip]

If a logged-in user clicks it:

Create a copy in their account.

Example:

Original:
Europe Adventure

Copied:
Europe Adventure — Copy

---

# 11. API Integration

Use APIs created by Member 3.

Do NOT create duplicate backend logic unless necessary.

Coordinate API response formats with Member 3.

---

# 12. UI Components

Create components such as:

CitySearch
CityCard
ActivitySearch
ActivityCard
ItineraryBuilder
TripStop
ActivityItem
Timeline
BudgetSummary
BudgetChart
ShareModal
PublicTrip

Keep components reusable.

---

# 13. Empty States

Handle:

No cities found

No activities found

No itinerary

No budget data

No shared trip

Example:

"No activities found for this city."

---

# 14. Loading and Error States

Show:

Loading...

Error loading activities.

Unable to save itinerary.

Trip shared successfully.

---

# 15. GitHub

Before starting:

git pull origin main

Commit meaningful work.

Examples:

feat: create city discovery

feat: implement activity search

feat: build itinerary builder

feat: add timeline

feat: create budget dashboard

feat: add budget chart

feat: implement trip sharing

feat: implement copy trip

Push:

git push origin main

---

# Priority

P0:
- City discovery
- Activity discovery
- Itinerary builder
- Timeline

P1:
- Budget
- Charts
- Public sharing

P2:
- Copy Trip
- Advanced visual polish

---

# Expected Result

A user should be able to:

Create Trip
↓
Search City
↓
Add City
↓
Search Activity
↓
Add Activity
↓
Schedule Activity
↓
View Timeline
↓
View Budget
↓
Share Trip
↓
Open Public Trip
↓
Copy Trip