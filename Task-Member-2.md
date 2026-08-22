# GlobeTrotter Hackathon — Member 2 Task

## Role

Frontend Developer — Dashboard + Trip Management + Responsive UI

---

## Main Responsibility

You are responsible for the main user interface.

Build:

1. Dashboard
2. My Trips
3. Create Trip
4. Edit Trip
5. Trip Details
6. Responsive design
7. Reusable UI components

---

# 1. Dashboard

Create a professional GlobeTrotter dashboard.

Show:

- Welcome message
- Upcoming trips
- Total trips
- Planned budget
- Recent trips
- Popular destinations
- Quick action to create trip

Example:

Welcome back, Arpeet!

[ Upcoming Trips ]

[ Total Trips ]

[ Planned Budget ]

[ + Plan New Trip ]

---

# 2. My Trips

Create trip cards.

Each card should show:

- Trip name
- Start date
- End date
- Number of destinations
- Estimated budget
- Cover image

Actions:

- View
- Edit
- Delete

---

# 3. Create Trip

Create a form:

- Trip name
- Start date
- End date
- Description
- Cover image (optional)

Validation:

- Trip name required
- Start date required
- End date required
- End date cannot be before start date

After successful creation:

Redirect to Trip Details.

---

# 4. Edit Trip

Allow users to update:

- Trip name
- Dates
- Description
- Cover image

---

# 5. Trip Details

Create the main trip page.

Suggested structure:

Trip Header

    Trip Name
    Date Range
    Destinations
    Budget

    [Edit Trip]
    [Share Trip]

Then:

    Itinerary
    Budget
    Timeline

---

# 6. Reusable Components

Create reusable components where useful:

components/
- Navbar
- Sidebar
- TripCard
- Button
- Input
- Modal
- Loading
- EmptyState
- ErrorState

Avoid creating duplicate components.

---

# 7. Responsive UI

The application must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Check:

- Navbar
- Sidebar
- Cards
- Forms
- Tables
- Timeline
- Charts

---

# 8. Design Guidelines

Use:

- Tailwind CSS
- Lucide icons
- Consistent spacing
- Clear typography
- Professional cards
- Good empty states
- Loading states
- Error states

Do not spend too much time on animations.

Functionality is more important.

---

# 9. API Integration

Use the backend APIs provided by Member 3.

Expected examples:

GET /api/trips

POST /api/trips

GET /api/trips/:id

PUT /api/trips/:id

DELETE /api/trips/:id

---

# 10. GitHub

Before starting:

git pull origin main

After meaningful work:

git add .
git commit -m "feat: create dashboard UI"
git push origin main

Make individual commits.

Examples:

feat: create dashboard layout

feat: implement trip cards

feat: create trip form

feat: add trip details page

fix: improve mobile trip layout

---

# Priority

P0:
- Dashboard
- My Trips
- Create Trip
- Trip Details

P1:
- Edit/Delete
- Responsive UI
- Loading/error states

P2:
- Advanced visual polish

---

# Expected Result

A user should be able to:

Login
↓
Open Dashboard
↓
Create Trip
↓
See Trip
↓
Open Trip Details
↓
Edit/Delete Trip

The UI should look professional and work on mobile.