# Deployment Instructions (Render.com)

This project is configured as a Monolithic React + Node.js application.

## 1. Push to GitHub
Ensure all your changes are pushed to GitHub.

## 2. Create Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your repository.

## 3. Configuration
Use the following settings exactly:

| Setting | Value |
| :--- | :--- |
| **Name** | `ayurpulse` (or your choice) |
| **Root Directory** | `. ` (Keep strictly defined as .) |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build && cd server && npm install` |
| **Start Command** | `cd server && npm start` |

## 4. Environment Variables
Add these in the "Environment" tab:
* `NODE_ENV`: `production` (Crucial!)
* `JWT_SECRET`: `your_random_secret_string`
* `EMAIL_USER`: `your_email@gmail.com` (If using notifications)
* `EMAIL_PASS`: `your_app_password`

## Notes
* **Database**: This uses SQLite. Your database will reset on every deployment in the free tier.
* **Local Development**: `npm run dev` in client and server folders works normally (API-only mode).
