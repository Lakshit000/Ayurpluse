# How to Deploy AyurPulse

This project is configured as a monolithic application where the Node.js backend serves the React frontend (from the `dist` folder).

## Recommended: Deploy on Render.com

1.  Create a new **Web Service** on [Render](https://dashboard.render.com/).
2.  Connect your GitHub repository: `https://github.com/Lakshit000/Ayurpluse`.
3.  Configure the following settings:
    *   **Root Directory**: `.` (Leave blank or set to dot)
    *   **Build Command**: `npm install && npm run build && cd server && npm install`
    *   **Start Command**: `cd server && npm start`
4.  Add Environment Variables (if needed):
    *   `JWT_SECRET`: (Generate a secure random string)
    *   `EMAIL_USER`: (Your email for Nodemailer, if used)
    *   `EMAIL_PASS`: (Your email app password)

## Important Note on Database
This project uses **SQLite**. On most cloud platforms (like Render's free tier), the filesystem is **ephemeral**. This means:
*   The database (`database.sqlite`) will reset every time you redeploy.
*   For a persistent production app, you should migrate to **PostgreSQL**.

## Local Development
1.  Frontend: `npm run dev` (Runs on port 5173)
2.  Backend: `cd server && npm run dev` (Runs on port 5001)
