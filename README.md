## Multi-Tenant Event Booking System (Payload CMS)

This project is built using Payload CMS as part of the WeframeTech Backend Hiring Task.
It implements a multi-tenant event booking system with waitlist, notifications, and organizer dashboard.

---

# Features

* Multi-Tenancy – Each tenant (organization) has isolated data.
* User Roles – attendee, organizer, admin.
* Event Management – Create and manage events with capacity limits.

---

# Booking Flow:

* Confirm booking if seats available.
* Auto-waitlist if event is full.
* Promote oldest waitlisted booking when a seat opens.
* Notifications – Created automatically on booking status changes.
* Booking Logs – Track all booking actions for auditing.
 ---

# Organizer Dashboard API:

* Upcoming events with booking counts.
* Circular progress (capacity usage).

---

# Tech Stack

* Backend Framework: Payload CMS
 (Node.js + Express)
* Database: MongoDB
* Language: TypeScript

---

# Deployment: 

Works locally or on Vercel

---

# Setup Instructions

1. Clone & Install
git clone <your-private-repo-url>
cd event-booking-backend
npm install

2. Environment Variables
Create a .env file (see .env.example):
MONGODB_URL=mongodb://localhost:27017/event-booking
PAYLOAD_SECRET=your-secret-key
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

3. Run Locally
npm run dev


Admin UI → http://localhost:3000/admin

4. Seed Data

Run the seed script to create tenants, users, and events:

npm run seed

---

# Seeded users:

* Tenant Organizer → user@gamil.com / user
* Attendee → user1@example.com / user 
* Admin User → user@example.com / user

---

# Roles & Access

* Attendee:
- Can book events for themselves.
- View their own bookings and notifications.

* Organizer:
- Manage events within their tenant.
- View bookings for their tenant’s events.
- Access the Organizer Dashboard.

* Admin:
- Full access to all tenant data.

---

# API Endpoints
* Booking Flow
- POST /api/book-event → Create booking (confirmed / waitlisted)
- POST /api/cancel-booking → Cancel booking & promote waitlist

* User
- GET /api/my-bookings → Get current user’s bookings
- GET /api/my-notifications → Get current user’s notifications
- POST /api/notifications/:id/read → Mark notification as read

* Organizer
- GET /api/dashboard → Organizer dashboard data

---

# Organizer Dashboard Data
- Upcoming Events with booking breakdown.
- Capacity Usage (circular progress %).
- Summary Analytics (confirmed, waitlisted, canceled totals).
- Recent Activity Feed (last 5 booking logs).

# Deployment Guide

- Push repo to GitHub (private).
- Deploy on Vercel or your server.
- Add .env in Vercel Environment Variables.

* Set Build Command:

npm run build
