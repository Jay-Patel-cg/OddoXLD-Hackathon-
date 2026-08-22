🌍 Musafir Buddy

AI-powered travel planning, itinerary management, destination discovery, budgeting, and travel assistance platform.

Musafir Buddy is a full-stack travel companion designed to make trip planning easier from the first destination search to the final day of a journey.

The platform combines a structured travel-management backend with Google Gemini AI to provide:

🗺️ Destination discovery

🤖 AI-powered trip planning

🧳 Multi-city itineraries

📅 Day-by-day activity planning

💰 Travel budget management

🧾 Expense tracking

🧠 Context-aware AI Travel Copilot

👥 Organizer and participant permissions

🔐 JWT authentication

🔑 Google authentication support

📸 Destination-focused travel imagery

📊 Trip and budget overviews

📌 Table of Contents

Project Overview

Problem Statement

Solution

Key Features

AI Capabilities

System Architecture

Technology Stack

Project Structure

Backend Architecture

Frontend Architecture

Authentication

Gemini AI Integration

AI Trip Planner

AI Travel Copilot

Destination Discovery

Trip Management

Budget and Expense Management

API Overview

Environment Variables

Installation

Running the Project

Testing

Security

AI Safety and Validation

Database Design

User Flow

Frontend UX

Error Handling

Development Guidelines

Git Workflow

Project Phases

Current Verification

Future Improvements

Hackathon Focus

Conclusion

🌎 Project Overview

Musafir Buddy is a travel platform that brings planning, discovery, budgeting, itinerary management, and AI assistance into one application.

Traditional travel planning usually requires users to switch between multiple services:

Search engines for destinations

Travel blogs for recommendations

Notes for itineraries

Spreadsheets for budgets

Separate expense apps

Messaging applications for group coordination

AI tools for planning

Musafir Buddy brings these responsibilities together.

The platform follows a simple principle:

Discover → Plan → Organize → Travel → Track → Ask AI

A user can discover a destination, generate an itinerary using Gemini, save it as a real trip, manage activities and stops, track expenses, and ask an AI assistant questions about the trip.

❗ Problem Statement

Travel planning can become complicated when users need to coordinate:

Multiple destinations

Different travel dates

Activities

Budgets

Expenses

Group members

Daily schedules

Destination research

AI can generate attractive travel plans, but raw AI output cannot be trusted directly as application data.

An AI model may:

Produce invalid dates

Exceed a user's budget

Generate invalid database IDs

Reference activities that do not exist

Create inconsistent itineraries

Return malformed JSON

Attempt to modify unauthorized data

Musafir Buddy addresses this by placing a deterministic backend validation layer between Gemini and the database.

The AI provides intelligence.

The backend provides authority.

💡 Solution

Musafir Buddy uses a layered architecture:

User
  ↓
Frontend
  ↓
Express REST API
  ↓
Authentication & Authorization
  ↓
Business Logic
  ↓
Validation
  ↓
MongoDB

For AI functionality:

User
  ↓
Frontend
  ↓
Musafir Buddy API
  ↓
AI Controller
  ↓
AI Service
  ↓
Gemini API
  ↓
Structured AI Response
  ↓
Backend Validation
  ↓
MongoDB

Gemini never directly controls the database.

✨ Key Features

1. Authentication

Users can authenticate using:

Email/password authentication

JWT-based sessions

Google OAuth authentication

Authentication is handled securely through the backend.

2. Destination Discovery

Users can:

Search destinations

Filter destinations

Browse popular destinations

View destination details

View estimated daily costs

View categories

View best times to visit

Explore destination imagery

3. AI Trip Planner

Users can provide:

Destination

Start date

End date

Budget

Number of travelers

Travel style

Preferences

Gemini generates a structured travel plan.

The backend then validates the plan before it can be saved.

4. Multi-City Trips

A trip can contain multiple stops.

Architecture:

User
  ↓
Trip
  ↓
TripStop
  ↓
Activity

This allows trips such as:

Ahmedabad
   ↓
Mumbai
   ↓
Goa
   ↓
Bangalore

Each stop contains:

City

Country

Arrival date

Departure date

Notes

Order

5. Activity Management

Activities can contain:

Title

Description

Location

Date

Start time

End time

Estimated cost

Currency

Category

Notes

Trip stop reference

6. Budget Management

Musafir Buddy separates:

Planned costs

AI-generated estimated activity costs.

Actual expenses

Real expenses recorded by the user.

This prevents AI estimates from being incorrectly treated as financial transactions.

7. Expense Tracking

Users can track expenses such as:

Food

Transport

Hotel

Sightseeing

Shopping

Entertainment

Adventure

Relaxation

Other

8. AI Travel Copilot

The AI assistant can understand the current trip context.

It can answer questions such as:

What's planned for tomorrow?

What activities are already scheduled?

Can I reduce my budget?

Suggest a cheaper activity.

Add a sunset activity.

Remove this activity.

Optimize my itinerary.

Organizer permissions allow controlled itinerary modifications.

Participants remain restricted from modifying the trip.

🤖 AI Capabilities

Musafir Buddy uses Google Gemini as its AI engine.

AI functionality is divided into three stages.

Phase 7A — Gemini Foundation

Establishes secure Gemini connectivity.

Endpoint:

GET /api/ai/test

Phase 7B — AI Trip Planner

Generates complete structured trip plans.

Endpoints:

POST /api/ai/trip-plan/generate
POST /api/ai/trip-plan/save

Phase 7C — AI Travel Copilot

Provides context-aware trip assistance.

Endpoint:

POST /api/ai/assistant

🏗️ System Architecture

                         ┌──────────────────────┐
                         │       Frontend       │
                         │ React + UI Components│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Express REST API   │
                         └──────────┬───────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
      Authentication          Trip Management        AI Services
             │                      │                      │
             ▼                      ▼                      ▼
           JWT                  MongoDB               Gemini API
                                    │
                                    ▼
                           Trip / Stops / Activities
                           Expenses / Destinations

🛠️ Technology Stack

Frontend

React

JavaScript

HTML

CSS

Tailwind CSS

React Router

Modern responsive UI

API-based state/data handling

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT

REST API

CORS

Google Gemini API

AI

Google Gemini

Official @google/genai SDK

Structured JSON generation

AI response validation

AI action validation

Development Tools

Git

GitHub

Postman

VS Code / Antigravity

npm

📁 Project Structure

OddoXLD-Hackathon-
│
├── Backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── activityController.js
│   │   │   ├── aiController.js
│   │   │   ├── authController.js
│   │   │   ├── destinationController.js
│   │   │   ├── expenseController.js
│   │   │   ├── healthController.js
│   │   │   ├── tripController.js
│   │   │   └── tripStopController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Activity.js
│   │   │   ├── Destination.js
│   │   │   ├── Expense.js
│   │   │   ├── Trip.js
│   │   │   ├── TripStop.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── activityRoutes.js
│   │   │   ├── aiRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── destinationRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── healthRoutes.js
│   │   │   ├── index.js
│   │   │   ├── tripRoutes.js
│   │   │   └── tripStopRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── ai/
│   │   │       ├── aiActionValidator.js
│   │   │       ├── aiAssistantService.js
│   │   │       ├── geminiService.js
│   │   │       ├── tripPlanValidator.js
│   │   │       └── tripPlannerService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── seedDestinations.js
│   │   │   ├── seedDestinations.js
│   │   │   ├── testActivities.js
│   │   │   ├── testAiAssistant.js
│   │   │   ├── testAuth.js
│   │   │   ├── testExpenses.js
│   │   │   ├── testGemini.js
│   │   │   ├── testTripPlanner.js
│   │   │   ├── testTrips.js
│   │   │   └── testTripStops.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── Frontend/
│   └── React application
│
├── .gitignore
└── README.md

🧩 Backend Architecture

The backend follows a controller/service/model architecture.

Controllers

Controllers handle HTTP requests and responses.

Examples:

authController
tripController
activityController
expenseController
destinationController
tripStopController
aiController

Services

Services contain reusable business logic.

AI services include:

geminiService.js
tripPlannerService.js
tripPlanValidator.js
aiAssistantService.js
aiActionValidator.js

This keeps Gemini-specific implementation away from controllers.

Models

MongoDB models represent application data.

Main models:

User
Trip
TripStop
Activity
Expense
Destination

🎨 Frontend Architecture

The frontend is designed around a travel-first user experience rather than a traditional admin dashboard.

Primary pages include:

Landing
Login
Signup
Dashboard
Explore
Destination Details
AI Planner
My Trips
Trip Details
Budget
Profile
Create Trip
AI Travel Copilot

The interface uses:

Modern top navigation

Destination cards

Destination-specific imagery

Responsive layouts

Smooth hover effects

Loading states

AI planning interfaces

Visual itinerary timelines

Budget visualization

The visual direction is based around:

Sky
Ocean
Beach
Mountain
Cloud
Natural travel colors

rather than a generic blue dashboard.

🔐 Authentication

Musafir Buddy uses JWT authentication for protected backend APIs.

The normal authentication flow is:

User
 ↓
Login
 ↓
Backend verifies credentials
 ↓
JWT generated
 ↓
Frontend stores authentication state
 ↓
Protected API requests include JWT

Google Authentication

Google authentication is also supported.

The intended flow is:

Frontend
   ↓
Google OAuth
   ↓
Google credential
   ↓
Backend
   ↓
Google identity verification
   ↓
Find or create user
   ↓
Musafir JWT
   ↓
Frontend
   ↓
Dashboard

Google credentials must never be hardcoded into the source code.

🔑 Gemini AI Integration

Gemini is integrated using Google's official JavaScript SDK:

@google/genai

The Gemini API key is read from environment variables.

Example:

GEMINI_API_KEY=your_actual_key
GEMINI_MODEL=your_configured_model

The API key must never be:

committed to Git

logged

returned by an API

placed in frontend source code

exposed in browser requests

The frontend communicates with Musafir's backend.

The backend communicates with Gemini.

🧠 AI Trip Planner

The AI Trip Planner uses a two-stage architecture.

Stage 1 — Generate

POST /api/ai/trip-plan/generate

The client sends trip preferences.

Example:

{
  "destination": "Goa",
  "startDate": "2026-11-10",
  "endDate": "2026-11-13",
  "budget": 25000,
  "travelers": 2,
  "travelStyle": "balanced"
}

The backend:

Validates input.

Retrieves trusted destination information.

Builds a Gemini prompt.

Requests structured JSON.

Validates Gemini's response.

Sanitizes the response.

Calculates budget metrics independently.

Returns the unpersisted plan.

Stage 2 — Save

POST /api/ai/trip-plan/save

The backend:

Re-validates the generated plan.

Creates a Trip.

Creates TripStops.

Creates Activities.

Links activities to stops.

Assigns the authenticated user as organizer.

Returns the saved trip.

💰 AI Budget Calculation

Gemini does not have authority over budget calculations.

The backend calculates:

estimatedTotalCost
remainingBudget
percentageOfBudget
isOverBudget

Conceptually:

estimatedTotalCost
=
sum(activity.estimatedCost)

Then:

remainingBudget
=
requestedBudget - estimatedTotalCost

And:

isOverBudget
=
estimatedTotalCost > requestedBudget

This prevents AI-generated summary values from being trusted blindly.

🧠 AI Travel Copilot

Endpoint:

POST /api/ai/assistant

The assistant loads trusted context from MongoDB.

Context may include:

Trip
TripStops
Activities
Expenses
Expense Summary

This allows the AI to understand the current trip.

Example:

User:
What do I have planned tomorrow?

Musafir AI:
You have a morning sightseeing activity,
lunch, and an evening beach activity scheduled.

AI Actions

Supported actions include:

ANSWER
RECOMMEND
ADD_ACTIVITY
UPDATE_ACTIVITY
DELETE_ACTIVITY
OPTIMIZE_BUDGET

🔒 AI Permission Model

Musafir Buddy distinguishes between organizers and participants.

Organizer

Can:

Ask questions

Request recommendations

Add activities

Update activities

Delete activities

Optimize the itinerary

Optimize the budget

Participant

Can:

Ask questions

Request recommendations

View trip information

Participants cannot perform itinerary modifications.

Non-member

Non-members cannot access private trip information.

🗺️ Destination Discovery

Destination discovery is powered by the Destination collection.

Destinations can contain:

name
country
state
region
description
imageUrl
costIndex
popularity
latitude
longitude
popularCategories
bestTimeToVisit
isActive

Destination endpoints are public.

Main routes:

GET /api/destinations
GET /api/destinations/popular
GET /api/destinations/:id

Users can search and filter destinations.

🧳 Trip Management

The trip hierarchy is:

User
  ↓
Trip
  ↓
TripStop
  ↓
Activity

This avoids creating a separate itinerary collection.

The itinerary is represented by ordered trip stops and activities.

📅 Trip Stops

A TripStop represents a city or destination within a trip.

Example:

Trip
 ├── Goa
 │    ├── Day 1 activities
 │    └── Day 2 activities
 │
 ├── Mumbai
 │    ├── Day 3 activities
 │    └── Day 4 activities
 │
 └── Pune
      └── Day 5 activities

Trip stops support:

Create

Read

Update

Delete

Reorder

🛡️ TripStop Security

Organizers have full rights.

Participants have read-only access.

Non-members are blocked.

TripStop validation includes:

Trip membership

Organizer permissions

Date boundaries

Overlap detection

Destination validation

Cross-trip protection

📅 Date Validation

TripStop dates must remain inside the trip date range.

Rules include:

arrivalDate >= trip.startDate

departureDate <= trip.endDate

departureDate >= arrivalDate

Trip stops within the same trip cannot overlap.

Activities linked to a stop must also fall inside the stop's date range.

💵 Budget and Expense Management

Musafir Buddy distinguishes between:

Estimated Activity Cost

Generated by AI as a planning estimate.

Actual Expense

Recorded by the user after spending money.

AI-generated estimated costs do not automatically create Expense documents.

This distinction is important for financial accuracy.

📊 Expense Categories

The backend supports categories including:

food
sightseeing
transport
hotel
shopping
entertainment
adventure
relaxation
other

🌐 API Overview

Health

GET /api/health

Authentication

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Additional authentication routes may be available depending on the current backend implementation.

Trips

Trip routes are available under:

/api/trips

Trip functionality includes:

Creating trips

Reading trips

Updating trips

Deleting trips

Trip overview

Activities

Activities are available under:

/api/trips/:tripId/activities

Expenses

Expenses are available under:

/api/trips/:tripId/expenses

Expense summaries are available through the corresponding expense summary endpoint.

Destinations

GET /api/destinations
GET /api/destinations/popular
GET /api/destinations/:id

Trip Stops

GET    /api/trips/:tripId/stops
POST   /api/trips/:tripId/stops
GET    /api/stops/:id
PUT    /api/stops/:id
DELETE /api/stops/:id
POST   /api/trips/:tripId/stops/reorder

Exact route behavior should follow the current backend route implementation.

Gemini Test

GET /api/ai/test

Protected by JWT.

Used to verify Gemini connectivity.

AI Trip Planner

POST /api/ai/trip-plan/generate
POST /api/ai/trip-plan/save

Both are protected by JWT.

AI Travel Copilot

POST /api/ai/assistant

Protected by JWT.

⚙️ Environment Variables

Create:

Backend/.env

Example:

PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

GEMINI_MODEL=your_configured_gemini_model

GOOGLE_CLIENT_ID=your_google_client_id

For the frontend, use the environment variables expected by the current frontend build system.

For Vite-based frontend configuration, an example is:

VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id

Never commit real secrets.

🚀 Installation

1. Clone the repository

git clone https://github.com/Jay-Patel-cg/OddoXLD-Hackathon-.git

Then:

cd OddoXLD-Hackathon-

📦 Backend Installation

Move into the backend:

cd Backend

Install dependencies:

npm install

Create .env:

touch .env

On Windows PowerShell, create the file manually if necessary.

Add the required environment variables.

🖥️ Frontend Installation

Move into:

cd Frontend

Install dependencies:

npm install

Configure the frontend environment variables according to the frontend build system.

▶️ Running the Backend

From:

Backend/

Run:

npm start

For development, if a development script is configured:

npm run dev

The server will run on the configured port.

▶️ Running the Frontend

From:

Frontend/

Run:

npm run dev

Open the local development URL shown by the frontend development server.

🧪 Testing

The project contains dedicated verification scripts.

From:

Backend/

run the relevant test scripts.

Authentication Tests

node src/utils/testAuth.js

Trip Tests

node src/utils/testTrips.js

Activity Tests

node src/utils/testActivities.js

Expense Tests

node src/utils/testExpenses.js

TripStop Tests

node src/utils/testTripStops.js

Gemini Tests

node src/utils/testGemini.js

AI Trip Planner Tests

node src/utils/testTripPlanner.js

AI Travel Copilot Tests

node src/utils/testAiAssistant.js

✅ Verification Results

The implemented backend phases were tested using dedicated automated suites.

Phase 6

TripStop and Destination test suite:

65 / 65 PASSED

Phase 7A

Gemini connectivity suite:

7 / 7 PASSED

Verified:

Health endpoint

Authentication protection

Gemini connectivity

Security assertions

Regression endpoints

Phase 7B

AI Trip Planner suite:

41 / 41 PASSED

Verified:

Request validation

Gemini structured output

Budget calculation

Trip persistence

TripStop persistence

Activity persistence

Authorization

ID injection prevention

Organizer spoofing prevention

Date validation

Activity validation

Rollback behavior

Regression

Phase 7C

AI Travel Copilot suite:

37 / 37 PASSED

Verified:

Authentication

Authorization

Organizer permissions

Participant restrictions

AI ANSWER action

AI RECOMMEND action

ADD_ACTIVITY

UPDATE_ACTIVITY

DELETE_ACTIVITY

OPTIMIZE_BUDGET

Foreign ID protection

Date validation

Category validation

Cost validation

Secret protection

Regression endpoints

🔐 Security

Security is a major part of the Musafir Buddy architecture.

JWT Authentication

Protected endpoints require an authenticated JWT.

Authorization

The backend verifies:

User identity

Trip membership

Organizer permissions

Participant permissions

API Key Protection

Gemini API keys are stored in environment variables.

They are never returned in API responses.

Database ID Protection

AI output cannot directly choose database IDs.

The backend creates and controls database identifiers.

Organizer Spoofing Protection

The organizer is determined from:

req.user._id

rather than trusting a client-provided organizer value.

Cross-Trip Security

Activities and TripStops are verified against the active trip.

A valid MongoDB ID belonging to another trip cannot simply be injected into a request.

🧠 AI Safety and Validation

The application does not trust AI output blindly.

The process is:

Gemini
 ↓
Structured JSON
 ↓
Schema Validation
 ↓
Business Validation
 ↓
Sanitization
 ↓
Budget Recalculation
 ↓
Database Persistence

This makes the AI layer safer and more predictable.

🧮 Backend-Authoritative Calculations

The AI may suggest:

estimatedCost

But the backend independently calculates totals.

The AI cannot manipulate:

estimatedTotalCost
remainingBudget
percentageOfBudget
isOverBudget

This is an important design principle:

AI suggests. Backend verifies.

🗄️ Database Design

Main relationships:

User
 │
 └── Trip
      │
      ├── TripStop
      │    │
      │    └── Activity
      │
      ├── Activity
      │
      └── Expense

Destinations are stored separately and referenced by trip stops.

🧭 User Flow

A typical user journey is:

Landing Page
      ↓
Sign Up / Login
      ↓
Dashboard
      ↓
Explore Destinations
      ↓
Destination Details
      ↓
Plan With AI
      ↓
Enter Preferences
      ↓
Gemini Generates Plan
      ↓
Review Itinerary
      ↓
Save Trip
      ↓
Trip Details
      ↓
Manage Activities
      ↓
Track Expenses
      ↓
Manage Budget
      ↓
Ask Musafir AI

🎨 Frontend UX

The frontend is intended to avoid the typical:

sidebar + blue cards + admin dashboard

pattern.

Instead, the design direction uses:

Floating top navigation

Large travel imagery

Destination discovery

Horizontal sliders

Destination detail pages

Visual itineraries

Timeline-based activities

Modern cards

Subtle hover interactions

Smooth transitions

Responsive layouts

Sky/ocean/mountain/beach-inspired colors

📸 Destination Images

Destination imagery is treated as an important part of the travel experience.

A destination should display images relevant to that destination.

For example:

Sydney
 ├── Sydney Harbour
 ├── Sydney Opera House
 ├── Bondi Beach
 └── Sydney skyline

A different destination should not reuse unrelated imagery simply to fill a card.

The image priority is:

Destination.imageUrl
        ↓
Destination-specific curated image
        ↓
Destination-specific fallback

🪄 AI Itinerary Experience

The generated itinerary should not simply be rendered as a block of text.

The frontend should visualize:

DAY 1

09:00
Breakfast

11:00
Sightseeing

13:30
Lunch

16:00
Beach

19:00
Dinner

Each activity can display:

Time

Title

Description

Location

Category

Estimated cost

Destination imagery

This turns the AI response into a useful travel product instead of a raw AI response.

⚠️ Error Handling

The frontend should gracefully handle:

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
500 Internal Server Error
503 AI Service Unavailable
Network Errors

Users should receive friendly messages.

For example:

Instead of:

AxiosError: Request failed with status code 503

show:

Musafir AI is temporarily unavailable.
Please try again in a moment.

⏳ AI Loading Experience

AI generation may take several seconds.

The UI should communicate progress without pretending to know the actual backend percentage.

Example messages:

Understanding your travel preferences...

Finding the best places...

Building your itinerary...

Balancing your budget...

Finalizing your journey...

The final result should replace the loading state.

A successful API response must never result in only:

Trip generated successfully

without displaying the generated plan.

📱 Responsive Design

Musafir Buddy should work across:

Desktop

Laptop

Tablet

Mobile

Important requirements:

No horizontal page overflow

Responsive navigation

Responsive destination grids

Responsive itinerary timelines

Touch-friendly controls

Mobile-friendly AI assistant

Responsive image galleries

🧑‍💻 Development Guidelines

When modifying the project:

Inspect existing code first.

Reuse existing APIs.

Avoid duplicate models.

Avoid duplicate business logic.

Keep secrets in environment variables.

Validate user input.

Never trust AI output directly.

Keep frontend and backend responsibilities separated.

Test changes before committing.

Avoid unnecessary changes to stable backend functionality.

🌿 Git Workflow

The project uses Git for version control.

Typical workflow:

git status

Review changes.

Then:

git add .

Commit:

git commit -m "feat: description"

Push:

git push origin main

Always review the staged files before committing.

Never commit:

.env
node_modules/
API keys
JWT secrets
database credentials

🧱 Project Development Phases

Musafir Buddy was developed incrementally.

Phase 1 — Backend Foundation

Established:

Express server

Database connection

Health API

Core backend structure

Phase 2 — Authentication

Added:

User model

Registration

Login

JWT authentication

Protected routes

Phase 3 — Trip Management

Added:

Trip model

Trip CRUD

Trip ownership

Trip management APIs

Phase 4 — Activities

Added:

Activity model

Activity CRUD

Activity validation

Trip/activity relationships

Phase 5 — Expenses

Added:

Expense model

Expense CRUD

Expense summaries

Budget-related functionality

Phase 6 — Multi-City Stops & Destination Discovery

Added:

Destination model

Destination discovery

Popular destinations

TripStop model

TripStop CRUD

TripStop ordering

Date validation

Overlap detection

Activity/TripStop integration

Trip overview

Verification:

65 / 65 tests passed

Phase 7A — Gemini AI Foundation

Added:

Official Gemini SDK

Gemini service

AI controller

AI routes

Gemini connectivity test

API key protection

Verification:

7 / 7 tests passed

Phase 7B — AI Trip Planner

Added:

Structured Gemini JSON generation

AI trip planner

Trip plan validator

Budget calculation

Trip persistence

TripStop persistence

Activity persistence

Security hardening

Rollback strategy

Verification:

41 / 41 tests passed

Phase 7C — AI Travel Copilot

Added:

Context-aware AI assistant

Trip context loading

Permission-aware AI actions

Activity modifications

Budget optimization

Action validation

Foreign ID protection

Participant restrictions

Verification:

37 / 37 tests passed

Phase 8 — Frontend Experience

The frontend focuses on bringing all backend capabilities into a polished travel experience.

Target areas include:

Landing page

Authentication

Dashboard

Explore

Destination details

AI Planner

My Trips

Trip details

Budget

Expenses

Profile

AI Travel Copilot

The frontend should consume the existing backend rather than duplicate backend functionality.

🏆 Hackathon Value Proposition

Musafir Buddy combines three important layers:

1. Discovery

Users can discover destinations and understand:

Where to go

What to see

When to visit

Estimated cost

Popular categories

2. Intelligence

Gemini helps users:

Create itineraries

Balance budgets

Recommend activities

Answer trip questions

Modify itineraries

Optimize travel plans

3. Management

Users can:

Save trips

Organize stops

Manage activities

Track expenses

Monitor budgets

Collaborate with participants

This creates an end-to-end travel experience.

🚦 Important AI Architecture Principle

Musafir Buddy does not treat Gemini as the application database.

Instead:

AI = Intelligence
Backend = Authority
MongoDB = Source of Truth
Frontend = Experience

This separation improves:

Security

Reliability

Validation

Maintainability

Predictability

🔒 Privacy Principles

The application should never expose:

Gemini API keys

JWT secrets

Database credentials

Private trip data to non-members

Internal authorization details

AI context should only contain data the authenticated user is authorized to access.

📈 Future Improvements

Potential future features include:

Travel Maps

Integrate maps for:

Destinations

Activities

Routes

Trip stops

Weather

Provide destination-specific weather information.

Hotel Recommendations

Suggest accommodations based on:

Budget

Location

Travel style

Transportation

Add:

Flights

Trains

Buses

Local transport

Collaborative Planning

Allow multiple users to collaboratively plan trips.

Real-Time Travel Assistant

Provide:

Weather alerts

Travel alerts

Schedule reminders

Location-based recommendations

Expense Splitting

For group trips:

Jay paid ₹3000
A paid ₹1500
B paid ₹500

Calculate who owes whom.

Offline Mode

Allow saved itineraries to remain available without an internet connection.

Personalized Recommendations

Learn from:

Favorite destinations

Activity preferences

Travel style

Previous trips

🧪 Production Readiness Checklist

Before deployment, verify:

Backend

Environment variables configured

MongoDB connection working

JWT secret configured

Gemini API key configured

Google Client ID configured

CORS configured

Error handling verified

All regression tests pass

Frontend

Production build succeeds

API URL configured

Google Client ID configured

Login works

Signup works

Google login works

Dashboard loads

Destinations load

Destination images are correct

AI Planner works

AI generated plan is displayed

Save Trip works

My Trips works

Budget works

Expenses work

Profile works

AI Copilot works

Mobile layout verified

No console errors

No broken images

🐛 Troubleshooting

Gemini is not working

Check:

GEMINI_API_KEY=...
GEMINI_MODEL=...

Then restart the backend server.

Environment changes require a server restart.

Google Login shows invalid_client

Check:

GOOGLE_CLIENT_ID
VITE_GOOGLE_CLIENT_ID

Make sure the OAuth client exists in Google Cloud and that the configured origins/redirect URIs match the development or production frontend URL.

Do not use a random OAuth Client ID.

API returns 401

Check:

JWT exists

JWT is not expired

Authorization header is correctly formatted

Expected format:

Authorization: Bearer <token>

API returns 403

The authenticated user may not have permission for the requested resource.

For trip operations, verify:

User is a member

User is organizer when modification is required

AI plan generates but does not display

The frontend must read the actual response from:

POST /api/ai/trip-plan/generate

and render:

data.plan

Do not only display the success message.

Destination images are repeated

Use:

Destination.imageUrl

when available.

Do not assign one global fallback image to every destination.

📜 License

This project was created as part of the Oddo x LD Hackathon.

Add the appropriate license if the project is later released publicly.

👨‍💻 Project

Musafir Buddy

AI-powered travel planning and management platform.

Repository:

https://github.com/Jay-Patel-cg/OddoXLD-Hackathon-.git

❤️ Final Vision

Musafir Buddy is designed around one simple idea:

Planning a trip should feel exciting, not complicated.

Instead of opening multiple applications to search for destinations, build itineraries, calculate budgets, track expenses, and ask for recommendations, users can manage their journey from one place.

The product combines:

🌍 Discover
      +
🤖 AI
      +
🗺️ Plan
      +
💰 Budget
      +
🧳 Manage
      +
💬 Travel Copilot

into one unified travel experience.

⭐ Musafir Buddy

Discover your destination.
Let AI plan your journey.
Travel with confidence.
