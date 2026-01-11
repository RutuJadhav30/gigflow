# GigFlow – Mini Freelance Marketplace 🚀

GigFlow is a full-stack mini freelance marketplace platform where **Clients can post jobs (Gigs)** and **Freelancers can apply by placing bids**.  
The platform demonstrates secure authentication, role-based actions, relational data modeling, and atomic hiring logic.

This project was built as part of a **Full Stack Development Internship Assignment**.

---

## 📌 Project Overview

GigFlow allows users to:
- Register and authenticate securely
- Post gigs as a client
- Browse and search available gigs
- Place bids as a freelancer
- Hire exactly one freelancer per gig with safe, atomic logic

Roles are **fluid**, meaning the same user can act as both a client and a freelancer.

---

## ✨ Core Features

### 🔐 User Authentication
- Secure user registration and login
- JWT-based authentication using **HttpOnly cookies**
- Protected routes for authenticated users

### 📄 Gig Management (CRUD)
- Create new job posts (Title, Description, Budget)
- Browse all open gigs
- Search gigs by title
- Gig status handling (`open`, `assigned`)

### 💼 Bidding System
- Freelancers can submit bids with a message and price
- Each gig can have multiple bids
- Only the gig owner can view received bids

### 🧠 Hiring Logic (Atomic)
- Client can hire **only one** freelancer per gig
- When a bid is hired:
  - Gig status changes to `assigned`
  - Selected bid is marked as `hired`
  - All other bids are automatically marked as `rejected`
- Logic handled securely to prevent race conditions

---

## 🛠 Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Redux Toolkit

### Backend
- Node.js
- Express.js
- JWT Authentication
- MongoDB with Mongoose

### Other Tools
- Git & GitHub
- Axios

---

## 📂 Project Structure

```text
gigflow/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── README.md
