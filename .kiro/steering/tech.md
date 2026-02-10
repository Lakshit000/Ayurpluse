# Technology Stack

## Frontend

- **Framework**: React 19.2.0 with Vite 7.2.4
- **Routing**: React Router DOM 7.13.0
- **Styling**: Tailwind CSS 4.1.18 with custom Ayurvedic color palette
- **UI Components**: 
  - Lucide React (icons)
  - Framer Motion (animations)
  - Recharts (analytics visualizations)
- **Additional Libraries**:
  - React Markdown (content rendering)
  - React Webcam (image capture for Prakruti analysis)
  - clsx & tailwind-merge (utility class management)

## Backend

- **Runtime**: Node.js with ES modules
- **Framework**: Express 4.18.2
- **Database**: SQLite3 5.1.7
- **Authentication**: 
  - bcryptjs (password hashing)
  - jsonwebtoken (JWT tokens)
- **Email**: Nodemailer 7.0.12 (Ethereal compatible)
- **File Processing**:
  - Jimp (image manipulation)
  - PDFKit (prescription generation)

## Development Tools

- **Linter**: ESLint 9.39.1 with React plugins
- **Build Tool**: Vite with React plugin
- **CSS Processing**: PostCSS with Autoprefixer

## Common Commands

### Frontend Development
```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd server
npm start            # Start Express server (port 5001)
npm run dev          # Start with --watch flag for auto-reload
```

### Full Stack Development
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

## API Proxy Configuration

Vite dev server proxies `/api/*` requests to `http://localhost:5001` (see vite.config.js)

## Environment Variables

Backend requires `.env` file in `server/` directory:
- `JWT_SECRET`: Secret key for JWT signing
- `EMAIL_USER`: Ethereal email username
- `EMAIL_PASS`: Ethereal email password
- `PORT`: Server port (default 5001)

## Database

SQLite database files:
- `database.sqlite` (root - legacy)
- `server/database.sqlite` (active)

Tables auto-created on server startup via `createTables()` function.
