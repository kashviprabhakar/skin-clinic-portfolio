# GlowSkin Clinic — Portfolio Site

A small multi-page portfolio / demo e-commerce site for a skin clinic (GlowSkin Clinic), with a Node/Express backend and MongoDB for persistence. The project supports products/services cart logic in the frontend, feedback collection saved in MongoDB, and basic security features (rate-limiting, input sanitization, and reCAPTCHA protection for feedback submissions).

This README describes how to set up, run, and test the application locally and how the backend API and frontend interact.

---

## Features

- Static frontend (HTML/CSS/JS) for home, services, products, cart, and feedback.
- Cart and services management in the browser with LocalStorage (products/services carts).
- Feedback submission stored in MongoDB via an Express API.
- Server-side validation for feedback submissions.
- Google reCAPTCHA verification to prevent spam.
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
- (For reCAPTCHA) A Google reCAPTCHA site key & secret. You can register at: https://www.google.com/recaptcha/admin

---

## Environment variables

Create a `.env` file in the project root (do NOT commit it) and set the following variables as needed:

```
# MongoDB connection URI (optional - default uses local mongodb://localhost:27017/glowskin-clinic)
MONGODB_URI=mongodb://localhost:27017/glowskin-clinic

# Port the server should listen on (optional)
PORT=5000

# Google reCAPTCHA secret (required if you enable reCAPTCHA verification on server)
RECAPTCHA_SECRET=your_recaptcha_secret_here
```

The frontend (feedback.html) needs the reCAPTCHA site key inserted into the widget placeholder:

```html
<div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY"></div>
```

Replace `YOUR_RECAPTCHA_SITE_KEY` with your site key from Google reCAPTCHA.

---

## Install dependencies

From the project root run:

```bash
npm install
# And install additional server-side packages if missing:
npm install helmet express-mongo-sanitize xss-clean express-rate-limit node-fetch@2
```

(Note: `node-fetch@2` is used in a CommonJS server environment to verify reCAPTCHA. If your Node version includes global fetch, you can modify the server code and remove the node-fetch dependency.)

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
  - Body: { name, mobile, email, service, rating, feedback, recaptcha }
  - Validates input, verifies recaptcha token (if configured), and saves feedback to MongoDB.

- GET /api/feedbacks?limit=500
  - Returns an array of saved feedbacks (most recent first). Optional `limit` query param.

- DELETE /api/feedbacks
  - Dev helper to delete all feedbacks (use with caution).

Other route files referenced in the server exist placeholders: `/api/orders`, `/api/products`, `/api/services`. Those can be implemented similarly if needed.

---

## Frontend behavior (feedback page)

- The feedback form validates inputs in the browser.
- The page includes a reCAPTCHA widget (you must replace the placeholder site key with your key).
- When the form is submitted, the client collects the reCAPTCHA token using `grecaptcha.getResponse()` and POSTs it to `/api/feedbacks` along with form data.
- On success the page refreshes the list by calling GET `/api/feedbacks` and renders them into the table.

If you serve the frontend from a different origin (e.g., a static server on a different port), ensure the server CORS settings allow the origin or adjust fetch URLs to include the API origin (e.g., `http://localhost:5000/api/feedbacks`). The server currently enables CORS globally with default settings.

---

## Security / Anti-spam

- Helmet is used to set secure HTTP headers.
- express-mongo-sanitize protects against NoSQL injection payloads.
- xss-clean reduces risk of stored XSS from payloads.
- express-rate-limit is configured with a global limiter and a stricter limiter on `/api/feedbacks` to prevent spam.
- Google reCAPTCHA is integrated to prevent automated submissions — add `RECAPTCHA_SECRET` to the server and `data-sitekey` to the frontend.

---

## Testing

1. Start your MongoDB and node server.
2. Open `feedback.html` in your browser (ensure reCAPTCHA site key is set and domain allowed in Google settings).
3. Submit a feedback and verify:
   - The server returns 201 Created.
   - GET /api/feedbacks shows the new entry.
   - MongoDB `feedbacks` collection contains the document.

You can also manually test the API using curl or Postman (note: POST requires a valid reCAPTCHA token unless `RECAPTCHA_SECRET` is not set — in which case the server logs a warning and skips verification).

---

## Next steps / Improvements

- Add admin authentication and an admin UI to view/export feedbacks (CSV export endpoint on server-side is safer than client-side CSV creation).
- Persist orders and product catalogue to the backend and connect the cart/checkout to create order records.
- Add stronger spam protections such as IP-based blocking or CAPTCHA fallback.
- Add tests for API endpoints and continuous integration.

---

## License

This project is provided as-is for demo/portfolio purposes. Add a license file if you want to make the licensing explicit.

---

If you want, I can commit this README.md to the repository for you. Would you like me to add it to the repo now?