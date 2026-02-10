# Project Structure

## Root Directory

```
ayurpulse/
├── src/                    # Frontend React application
├── server/                 # Backend Express API
├── data/                   # CSV seed data files
├── public/                 # Static assets
├── .kiro/                  # Kiro configuration
├── index.html              # Vite entry point
└── package.json            # Frontend dependencies
```

## Frontend Structure (`src/`)

```
src/
├── components/
│   ├── doctor/            # Doctor portal components
│   │   ├── DoctorHome.jsx
│   │   ├── DoctorPatients.jsx
│   │   ├── DoctorClinicalEntry.jsx
│   │   ├── DoctorPanchakarma.jsx
│   │   ├── DoctorAnalytics.jsx
│   │   ├── PatientDetailsModal.jsx
│   │   └── PanchakarmaDetailsModal.jsx
│   ├── patient/           # Patient portal components
│   │   ├── PatientHome.jsx
│   │   ├── PatientProfile.jsx
│   │   ├── PatientHealth.jsx
│   │   ├── PatientRecords.jsx
│   │   ├── PatientAppointments.jsx
│   │   ├── PatientDoctors.jsx
│   │   ├── PatientPrakruti.jsx
│   │   ├── PatientPanchakarma.jsx
│   │   ├── PatientPredictive.jsx
│   │   ├── PatientAyurGPT.jsx
│   │   └── PatientJiva.jsx
│   ├── AuthTabs.jsx       # Login/Register tabs
│   ├── DoctorAuth.jsx     # Doctor authentication
│   ├── PatientAuth.jsx    # Patient authentication
│   ├── DoctorDashboard.jsx
│   ├── PatientDashboard.jsx
│   ├── Navbar.jsx
│   ├── NotificationBell.jsx
│   ├── Settings.jsx
│   ├── VerifyEmail.jsx
│   ├── RoleCard.jsx
│   ├── BackgroundDecor.jsx
│   ├── CurrentTime.jsx
│   └── TrustBadge.jsx
├── App.jsx                # Main app with routing
├── main.jsx               # React entry point
├── App.css
└── index.css              # Tailwind imports
```

## Backend Structure (`server/`)

```
server/
├── server.js              # Main Express server with all routes
├── database.sqlite        # Active SQLite database
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── public/                # Built frontend assets (deployment)
└── [utility scripts]      # Database seeding, testing, debugging
```

## Data Files (`data/`)

CSV files for seeding Ayurvedic medical data:
- `disease_master.csv` - Disease definitions
- `symptoms.csv` - Symptom catalog
- `medical_master.csv` - Medicine database
- `disease_medicine_master.csv` - Disease-medicine mappings
- `treatment.csv` - Treatment protocols
- `pathyam.csv` / `apsthyam.csv` - Dietary recommendations
- `causes.csv` - Disease causes
- `investigations.csv` - Diagnostic tests

## Architecture Patterns

### Component Organization
- **Role-based folders**: Separate `doctor/` and `patient/` component directories
- **Modal pattern**: Detail modals for complex data (PatientDetailsModal, PanchakarmaDetailsModal)
- **Dashboard pattern**: Main dashboard components orchestrate sub-views

### State Management
- Local state with `useState` for component-level data
- Props drilling for user data (userId, userName, role)
- No global state library (Redux/Context) currently used

### Routing
- React Router DOM with Routes/Route components
- Main views: home, auth, doctorDashboard, patientDashboard
- Special routes: `/verify-email`, `/settings`

### API Structure
- RESTful endpoints prefixed with `/api/`
- Role-specific routes: `/api/doctor/*`, `/api/patient/*`
- Shared routes: `/api/appointments`, `/api/notifications`

### Database Schema
Tables created programmatically in `server.js`:
- `users` - Both doctors and patients (role field)
- `appointments` - Scheduling
- `clinical_records` - Medical records
- `medications` - Active prescriptions
- `panchakarma_cycles` - Treatment cycles
- `panchakarma_stages` - Individual therapy stages
- `dosha_history` - Prakruti/Vikruti tracking
- `notifications` - User notifications
- `system_settings` - App configuration
- `audit_logs` - Activity tracking

### Styling Conventions
- Tailwind utility classes throughout
- Custom color palette in `tailwind.config.js`:
  - `primary.*` - Deep herbal green (#1a472a)
  - `secondary.*` - Soft mint (#ecfdf5)
  - `accent.*` - Warm beige (#f7f3e8)
  - `gold.*` - Gold accents (#d4af37)
- Framer Motion for page transitions and animations
- Glass morphism effects with backdrop blur

## File Naming
- React components: PascalCase (e.g., `PatientHome.jsx`)
- Utility scripts: snake_case (e.g., `seed_data.js`)
- Config files: kebab-case (e.g., `tailwind.config.js`)
