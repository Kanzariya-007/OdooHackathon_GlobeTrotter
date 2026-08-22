# GlobeTrotter Hackathon — Member 1 Task

## Role

Team Leader + Authentication + Integration + Final Testing

---

## Main Responsibility

You are responsible for:

1. Project setup
2. GitHub coordination
3. Authentication
4. Login/Signup
5. Protected routes
6. Common application integration
7. Final testing
8. Final submission coordination

Do NOT try to build every feature yourself.

---

# 1. Project Setup

Create/maintain the main project structure.

Recommended:

client/
server/

client:
- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React
- Recharts

server:
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- bcrypt

---

# 2. Authentication

Implement:

## Signup

Fields:

- Name
- Email
- Password
- Confirm Password

Validation:

- Name required
- Valid email
- Password required
- Password confirmation must match
- Email should be unique

---

## Login

Fields:

- Email
- Password

On successful login:

- Store authentication token
- Redirect to dashboard

On invalid credentials:

- Show clear error message

---

# 3. Authentication API

Expected APIs:

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

---

# 4. Protected Routes

Users should not access private pages without authentication.

Private pages:

- Dashboard
- My Trips
- Create Trip
- Trip Details
- Itinerary
- Budget
- Settings

Public:

- Login
- Signup
- Public Shared Trip

---

# 5. Common UI

Create/maintain:

- Navbar
- Sidebar
- Page container
- Loading component
- Error message
- Toast/notification system
- Button styles
- Form styles

Avoid editing feature-specific pages unless necessary.

---

# 6. GitHub Responsibility

The final application must be in `main`.

Every team member must make individual commits.

Use meaningful commit messages.

Examples:

git add .
git commit -m "feat: implement user authentication"
git push origin main

Before working:

git pull origin main

---

# 7. Integration Responsibility

Regularly check:

Frontend
    ↓
API
    ↓
PostgreSQL
    ↓
API
    ↓
Frontend

Make sure all modules work together.

Do not wait until 4:50 PM for integration.

---

# 8. Final Testing

Test the complete user flow:

Signup
↓
Login
↓
Dashboard
↓
Create Trip
↓
Add Cities
↓
Add Activities
↓
Build Itinerary
↓
Budget
↓
Timeline
↓
Share Trip
↓
Open Public Trip

---

# 9. Final Submission Preparation

Before 5 PM:

- Check main branch
- Check latest commits
- Check application runs
- Check database works
- Check public sharing works
- Check responsive UI
- Check GitHub repository
- Coordinate demo video
- Coordinate final submission

---

# Priority

P0:
- Project setup
- Authentication
- Integration
- Final testing

P1:
- Common UI
- Loading/error handling

P2:
- User settings

Do NOT spend hackathon time building unnecessary features.

---

# Expected Result

By the end of the hackathon:

- Authentication works
- Protected routes work
- All members' modules are integrated
- `main` contains the latest working project
- Complete demo flow works
- Project is ready for submission