# HelpDesk Mini - Hackathon Project

HelpDesk Mini is a full-stack ticketing system built with the MERN stack (MongoDB, Express, React, Node.js). It features role-based access for users and agents, a commenting system, and a robust API designed to meet modern web standards.

**Live Demo URL:** `https://papaya-cobbler-febfb4.netlify.app/`

---

## Core Features

* **User Authentication**: Secure registration and login using JWT.
* **Role-Based Access Control (RBAC)**:
    * **Users**: Can create tickets and view/comment on their own tickets.
    * **Agents**: Can view all tickets, assign tickets to themselves, update status, and comment.
* **Ticket Management**: Create, view, update status, and add threaded comments.
* **Detailed Ticket View**: A dedicated page for each ticket showing its history and comments.
* **Robust API**: Implements pagination, rate limiting, idempotency, and optimistic locking.

---

## Architecture Note

This project follows a standard client-server architecture.

* **Backend**: A RESTful API built with Node.js and Express.js. It connects to a MongoDB database using Mongoose for data modeling. The API handles all business logic, including user authentication (JWT), role-based authorization, and all CRUD operations for tickets and comments. It's designed for robustness with features like rate limiting, idempotency for POST requests, and optimistic locking for concurrent updates.

* **Frontend**: A single-page application (SPA) built with React. It uses React Router for page navigation and the Context API for global state management (specifically for authentication). The UI is conditionally rendered based on the user's role, providing a different experience for regular users and agents. All communication with the backend is done via asynchronous requests using Axios.

---

## API Summary & Examples

### Authentication

* `POST /api/users/register` - Register a new user.
* `POST /api/users/login` - Log in and receive a JWT.

### Tickets

* `POST /api/tickets` - Create a new ticket (user role).
    * **Headers**: `x-auth-token`, `Idempotency-Key`
* `GET /api/tickets?limit=10&offset=0` - Get tickets for the logged-in user (paginated).
    * **Headers**: `x-auth-token`
* `GET /api/tickets/all?limit=10&offset=0` - Get all tickets (agent/admin roles, paginated).
    * **Headers**: `x-auth-token`
* `GET /api/tickets/:id` - Get a single ticket and its comments.
    * **Headers**: `x-auth-token`
* `PATCH /api/tickets/:id/status` - Update a ticket's status (agent/admin roles).
    * **Headers**: `x-auth-token`
    * **Body**: `{ "status": "in-progress", "version": 0 }`

### Comments

* `POST /api/tickets/:id/comments` - Add a comment to a ticket.
    * **Headers**: `x-auth-token`, `Idempotency-Key`

---

## Test User Credentials

You can use the application to register your own users, or use the following pre-seeded credentials.

* **User Account**:
    * **Email**: `user@example.com`
    * **Password**: `password123`

* **Agent Account**:
    * **Email**: `agent@example.com`
    * **Password**: `agent@123`


---

## How to Run Locally

1.  **Clone the repository**: `git clone https://github.com/Raunit2025/helpdesk-mini.git`
2.  **Navigate to the backend**: `cd helpdesk-mini/backend`
3.  **Install backend dependencies**: `npm install`
4.  **Create a `.env` file** in the `backend` folder with your `MONGO_URI` and `JWT_SECRET`.
5.  **Start the backend server**: `node server.js`
6.  **Open a new terminal** and navigate to the frontend: `cd ../frontend`
7.  **Install frontend dependencies**: `npm install`
8.  **Start the frontend app**: `npm start`

The application will be available at `http://localhost:3000`.
