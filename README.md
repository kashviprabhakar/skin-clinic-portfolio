# GlowSkin Clinic — Portfolio Site

A small multi-page portfolio / demo e-commerce site for a skin clinic (GlowSkin Clinic), with a Node/Express backend and MongoDB for persistence. The project supports products/services cart logic in the browser and a feedback submission API backed by MongoDB.

This README describes how to set up, run, and test the application locally and how the backend API and frontend interact.

---

## Features

- Static frontend (HTML/CSS/JS) for home, services, products, cart, and feedback.
- Cart and services management in the browser with LocalStorage (products/services carts).
- Feedback submission stored in MongoDB via an Express API.
- Server-side validation for feedback submissions.
- Rate limiting (global + stricter feedback limiter) and basic security middlewares (Helmet, mongo-sanitize, XSS clean).

---

## Repo structure (important files)

- `index.html` — Home page
- `feedback.html` — Feedback page (has the form and client-side logic)
- `script.js` — Global frontend logic for carts and feedback client integration
- `server/server.js` — Express server entrypoint
- `server/models/Feedback.js` — Mongoose model for feedback
- `server/routes/feedback.js` — Feedback API routes (POST, GET, DELETE)

---

## Prerequisites

- Node.js (16+ recommended) and npm
- MongoDB (local or remote). If you use MongoDB Atlas, have connection URI available.

---

## Environment variables

Create a `.env` file in the project root (do NOT commit it) and set the following variables as needed:

```
# MongoDB connection URI (optional - default uses local mongodb://localhost:27017/glowskin-clinic)
MONGODB_URI=mongodb://localhost:27017/glowskin-clinic

# Port the server should listen on (optional)
PORT=5000
```

Note: This project previously included optional Google reCAPTCHA integration. The current codebase has reCAPTCHA removed from the frontend and server-side verification has been disabled in `server/routes/feedback.js`. If you want to re-enable reCAPTCHA later, you'll need to add the widget to `feedback.html` and restore verification on the server.

---

## Install dependencies

From the project root run:

```bash
npm install
# Additional server-side packages used by the project (example):
# npm install helmet express-mongo-sanitize xss-clean express-rate-limit
```

---

## Run the server

Start MongoDB locally or ensure your `MONGODB_URI` points to a running MongoDB.

```bash
node server/server.js
# or using nodemon
npx nodemon server/server.js
```

The server will listen on `PORT` (default 5000) and exposes API routes under `/api`.

---

## API endpoints (summary)

- GET /api/health
  - Returns a simple JSON health check.

- POST /api/feedbacks
  - Body: { name, mobile, email, service, rating, feedback }
  - Validates input and saves feedback to MongoDB.

- GET /api/feedbacks?limit=500
  - Returns an array of saved feedbacks (most recent first). Optional `limit` query param.

- DELETE /api/feedbacks
  - Dev helper to delete all feedbacks (use with caution).

Other route files referenced in the server exist placeholders: `/api/orders`, `/api/products`, `/api/services`. Those can be implemented similarly if needed.

---

## Frontend behavior (feedback page)

- The feedback form validates inputs in the browser.
- When the form is submitted, the client POSTs the feedback to `/api/feedbacks`.
- On success the page refreshes the list by calling GET `/api/feedbacks` and renders them into the table.

If you serve the frontend from a different origin (e.g., a static server on a different port), ensure the server CORS settings allow the origin or adjust fetch URLs to include the API origin (e.g., `http://localhost:5000/api/feedbacks`). The server currently enables CORS globally with default settings.

---

## Security / Anti-spam

- Helmet is used to set secure HTTP headers.
- express-mongo-sanitize protects against NoSQL injection payloads.
- xss-clean reduces risk of stored XSS from payloads.
- express-rate-limit is configured with a global limiter and a stricter limiter on `/api/feedbacks` to prevent spam.

Consider adding further protections if you expect public traffic (IP throttling, honeypot fields, authenticated admin UI, etc.).

---

## Testing

1. Start your MongoDB and node server.
2. Open `feedback.html` in your browser.
3. Submit a feedback and verify:
   - The server returns 201 Created.
   - GET /api/feedbacks shows the new entry.
   - MongoDB `feedbacks` collection contains the document.

You can also manually test the API using curl or Postman.

---

## Next steps / Improvements

- Add admin authentication and an admin UI to view/export feedbacks (CSV export endpoint on server-side is safer than client-side CSV creation).
- Persist orders and product catalogue to the backend and connect the cart/checkout to create order records.
- Add stronger spam protections and monitoring.
- Add tests for API endpoints and continuous integration.

---

## License

This project is provided as-is for demo/portfolio purposes. Add a license file if you want to make the licensing explicit.
