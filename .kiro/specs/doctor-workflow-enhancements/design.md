# Design Document: Doctor Workflow Enhancements

## Overview

The Doctor Workflow Enhancements feature extends the existing AyurPulse doctor portal with six major capability areas designed to improve clinical efficiency and reduce manual work. This design builds upon the existing React/Express/SQLite architecture and follows established patterns in the codebase including modal-based detail views, real-time search with autocomplete, and timeline-based history displays.

The enhancement focuses on providing doctors with comprehensive patient context, intelligent prescription assistance, automated follow-up management, clinical decision support, advanced search capabilities, and streamlined appointment management. All features integrate seamlessly with existing components like `DoctorDashboard.jsx`, `DoctorPatients.jsx`, and `DoctorClinicalEntry.jsx`.

## Architecture

### Frontend Architecture

**Component Structure:**
- New components will follow the existing pattern of placing doctor-specific components in `src/components/doctor/`
- Modal components for detailed views (following `PatientDetailsModal.jsx` pattern)
- Reusable sub-components for timeline views, prescription templates, and search interfaces
- Integration with existing dashboard navigation and state management patterns

**Key New Components:**
- `PatientTimelineView.jsx` - Comprehensive medical history timeline
- `PrescriptionBuilder.jsx` - Enhanced prescription creation with templates
- `FollowUpManager.jsx` - Follow-up tracking and scheduling interface
- `ClinicalDecisionSupport.jsx` - Intelligent suggestions and alerts
- `AdvancedPatientSearch.jsx` - Enhanced search with filters and presets
- `AppointmentCalendar.jsx` - Calendar view with appointment management

**State Management:**
- Continue using local component state with `useState`
- Props drilling for user context (doctorId, doctorName)
- Real-time data fetching with periodic polling for live updates
- Optimistic UI updates for better perceived performance

### Backend Architecture

**API Endpoints:**
All new endpoints follow the existing `/api/doctor/*` pattern:

- `GET /api/doctor/patient-timeline/:patientId` - Complete patient history
- `GET /api/doctor/prescription-templates` - User's saved templates
- `POST /api/doctor/prescription-templates` - Save new template
- `GET /api/doctor/follow-ups` - Pending follow-ups list
- `POST /api/doctor/follow-ups` - Create follow-up reminder
- `GET /api/doctor/clinical-suggestions` - Decision support data
- `GET /api/doctor/patients/search` - Advanced patient search
- `GET /api/doctor/appointments/calendar` - Calendar view data
- `PUT /api/doctor/appointments/:id/status` - Update appointment status
- `POST /api/doctor/prescriptions/pdf` - Generate PDF prescription

**Database Schema Extensions:**

New tables to be created:

```sql
-- Prescription Templates
CREATE TABLE prescription_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    medicines TEXT NOT NULL, -- JSON array
    pathyam TEXT, -- JSON array
    apathyam TEXT, -- JSON array
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Follow-up Reminders
CREATE TABLE follow_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    clinical_record_id INTEGER,
    due_date TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, overdue, cancelled
    priority TEXT DEFAULT 'normal', -- low, normal, high
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (clinical_record_id) REFERENCES clinical_records(id)
);

-- Favorite Medicines (per doctor)
CREATE TABLE favorite_medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    medicine_id INTEGER NOT NULL,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(id),
    UNIQUE(doctor_id, medicine_id)
);

-- Search Filter Presets
CREATE TABLE search_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    filters TEXT NOT NULL, -- JSON object with filter criteria
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Drug Interactions Database
CREATE TABLE drug_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medicine_a_id INTEGER NOT NULL,
    medicine_b_id INTEGER NOT NULL,
    severity TEXT NOT NULL, -- mild, moderate, severe
    description TEXT NOT NULL,
    FOREIGN KEY (medicine_a_id) REFERENCES medicines(id),
    FOREIGN KEY (medicine_b_id) REFERENCES medicines(id)
);

-- Treatment Outcomes (for statistics)
CREATE TABLE treatment_outcomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clinical_record_id INTEGER NOT NULL,
    diagnosis TEXT NOT NULL,
    vikruti_before TEXT, -- JSON dosha scores
    vikruti_after TEXT, -- JSON dosha scores
    outcome TEXT, -- improved, stable, worsened
    follow_up_date TEXT,
    notes TEXT,
    FOREIGN KEY (clinical_record_id) REFERENCES clinical_records(id)
);
```

**Modifications to Existing Tables:**

```sql
-- Add columns to appointments table
ALTER TABLE appointments ADD COLUMN notes TEXT;
ALTER TABLE appointments ADD COLUMN blocked_slot INTEGER DEFAULT 0;

-- Add columns to clinical_records table
ALTER TABLE clinical_records ADD COLUMN pathyam TEXT; -- JSON array
ALTER TABLE clinical_records ADD COLUMN apathyam TEXT; -- JSON array
ALTER TABLE clinical_records ADD COLUMN follow_up_date TEXT;
```

## Components and Interfaces

### 1. Patient Timeline View Component

**Purpose:** Display comprehensive patient medical history in chronological order with filtering capabilities.

**Component Interface:**
```typescript
interface PatientTimelineViewProps {
  patientId: number;
  onClose: () => void;
}

interface TimelineEntry {
  id: number;
  type: 'clinical_record' | 'dosha_assessment' | 'panchakarma' | 'document';
  date: string;
  title: string;
  summary: string;
  details: any; // Type-specific details
}

interface TimelineFilters {
  dateRange: { start: string; end: string } | null;
  recordTypes: string[];
}
```

**Key Features:**
- Unified timeline combining clinical records, dosha history, Panchakarma treatments
- Expandable entries showing full details
- Date range picker for filtering
- Record type checkboxes (Clinical, Dosha, Panchakarma, Documents)
- Visual dosha chart showing Prakruti baseline and Vikruti changes over time
- Document download capability for shared files

**Implementation Notes:**
- Use Recharts for dosha visualization (line chart showing Vata/Pitta/Kapha over time)
- Implement virtual scrolling for large timelines (performance optimization)
- Cache timeline data in component state to avoid repeated API calls
- Use Framer Motion for smooth expand/collapse animations

### 2. Enhanced Prescription Builder Component

**Purpose:** Streamline prescription creation with templates, favorites, and intelligent assistance.

**Component Interface:**
```typescript
interface PrescriptionBuilderProps {
  patientId: number;
  doctorId: number;
  initialPrescription?: Prescription;
  onSave: (prescription: Prescription) => void;
}

interface Prescription {
  medicines: Medicine[];
  pathyam: string[];
  apathyam: string[];
  notes: string;
}

interface Medicine {
  id?: number;
  name: string;
  dosage: string;
  timing: string;
  duration: string;
  form: string;
}

interface PrescriptionTemplate {
  id: number;
  name: string;
  description: string;
  medicines: Medicine[];
  pathyam: string[];
  apathyam: string[];
}
```

**Key Features:**
- Medicine search with autocomplete (extends existing implementation)
- Favorites list with quick-add buttons
- Template management (save, load, delete)
- Copy from previous prescription with modification
- Pathyam/Apathyam autocomplete from database
- PDF generation with clinic branding
- Prescription history view with search

**Implementation Notes:**
- Extend existing medicine search in `DoctorClinicalEntry.jsx`
- Use PDFKit for server-side PDF generation
- Store templates as JSON in database
- Implement debounced search (300ms) for autocomplete
- Add "Add to Favorites" star icon next to each medicine

### 3. Follow-up Manager Component

**Purpose:** Track and manage patient follow-ups with automated suggestions and compliance monitoring.

**Component Interface:**
```typescript
interface FollowUpManagerProps {
  doctorId: number;
}

interface FollowUp {
  id: number;
  patientId: number;
  patientName: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  diagnosis: string;
  notes: string;
  createdAt: string;
}

interface FollowUpSuggestion {
  recommendedDate: string;
  reason: string;
  diagnosisType: string;
}
```

**Key Features:**
- Pending follow-ups list sorted by priority and due date
- Automatic follow-up date suggestions based on diagnosis
- Bulk scheduling for multiple patients
- Compliance rate calculation per patient
- Integration with appointment system
- Notifications for doctor and patient

**Implementation Notes:**
- Suggestion algorithm based on diagnosis keywords:
  - Acute conditions: 3-7 days
  - Chronic conditions: 2-4 weeks
  - Panchakarma: Weekly during treatment
  - Post-treatment: 1 month
- Daily cron job to mark overdue follow-ups
- Send notifications via existing notification system
- Link to appointment creation when scheduling follow-up

### 4. Clinical Decision Support Component

**Purpose:** Provide intelligent suggestions, warnings, and treatment guidelines during clinical workflow.

**Component Interface:**
```typescript
interface ClinicalDecisionSupportProps {
  patientId: number;
  diagnosis: string;
  currentMedicines: Medicine[];
  patientAllergies: string[];
  vikruti: DoshaScores;
}

interface MedicineSuggestion {
  medicineId: number;
  medicineName: string;
  reason: string;
  confidence: number; // 0-1
}

interface DrugInteraction {
  medicineA: string;
  medicineB: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}

interface PanchakarmaRecommendation {
  protocol: string;
  reason: string;
  duration: string;
}
```

**Key Features:**
- Medicine suggestions based on diagnosis and Vikruti
- Drug interaction warnings
- Allergy alerts (prominent display)
- Panchakarma protocol recommendations
- Treatment outcome statistics for similar cases
- Quick-reference treatment guidelines

**Implementation Notes:**
- Medicine suggestions based on disease_medicine_master.csv data
- Drug interactions checked against drug_interactions table
- Allergy alerts shown as prominent banner before prescription finalization
- Panchakarma recommendations based on Vikruti imbalance severity
- Treatment statistics aggregated from treatment_outcomes table
- Guidelines stored as markdown files, rendered with React Markdown

### 5. Advanced Patient Search Component

**Purpose:** Enable efficient patient discovery and filtering with saved presets.

**Component Interface:**
```typescript
interface AdvancedPatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
}

interface SearchFilters {
  query: string; // Name, phone, ID, diagnosis
  doshaType: string[]; // vata, pitta, kapha
  treatmentStatus: string[]; // active, completed, pending
  lastVisitRange: { start: string; end: string } | null;
}

interface SearchPreset {
  id: number;
  name: string;
  filters: SearchFilters;
}

interface PatientSearchResult {
  id: number;
  name: string;
  phone: string;
  diagnosis: string;
  lastVisit: string;
  vikrutiStatus: string;
  pendingFollowUp: boolean;
}
```

**Key Features:**
- Multi-field search (name, phone, ID, diagnosis)
- Filter by dosha type, treatment status, last visit date
- Save and load filter presets
- Recently viewed patients quick access
- Key health indicators in results (Vikruti, last visit, pending follow-ups)

**Implementation Notes:**
- Extend existing patient search in `DoctorPatients.jsx`
- Use SQL LIKE for text search across multiple fields
- Store presets as JSON in search_presets table
- Recently viewed tracked in localStorage (last 10 patients)
- Health indicators calculated on backend for performance

### 6. Appointment Calendar Component

**Purpose:** Provide calendar-based appointment management with status tracking and statistics.

**Component Interface:**
```typescript
interface AppointmentCalendarProps {
  doctorId: number;
  view: 'day' | 'week';
}

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  blockedSlot: boolean;
}

interface AppointmentStatistics {
  completionRate: number;
  cancellationRate: number;
  noShowRate: number;
  totalAppointments: number;
}
```

**Key Features:**
- Daily and weekly calendar views
- Status updates (completed, cancelled, no-show)
- Quick notes on appointments
- Reschedule with automatic patient notifications
- Block time slots for breaks/procedures
- Statistics dashboard (completion, cancellation, no-show rates)

**Implementation Notes:**
- Use CSS Grid for calendar layout
- Color-code appointments by status
- Drag-and-drop for rescheduling (optional enhancement)
- Send notifications via existing Nodemailer setup
- Statistics calculated for selected date range (default: last 30 days)
- Link to clinical record creation from completed appointments

## Data Models

### Prescription Template Model
```typescript
interface PrescriptionTemplate {
  id: number;
  doctorId: number;
  name: string;
  description: string;
  medicines: {
    name: string;
    dosage: string;
    timing: string;
    duration: string;
    form: string;
  }[];
  pathyam: string[];
  apathyam: string[];
  createdAt: string;
}
```

### Follow-up Model
```typescript
interface FollowUp {
  id: number;
  patientId: number;
  doctorId: number;
  clinicalRecordId: number | null;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  notes: string;
  createdAt: string;
  completedAt: string | null;
}
```

### Timeline Entry Model
```typescript
interface TimelineEntry {
  id: number;
  type: 'clinical_record' | 'dosha_assessment' | 'panchakarma' | 'document';
  date: string;
  title: string;
  summary: string;
  details: ClinicalRecord | DoshaAssessment | PanchakarmaStage | Document;
}
```

### Drug Interaction Model
```typescript
interface DrugInteraction {
  id: number;
  medicineAId: number;
  medicineBId: number;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
}
```

### Search Preset Model
```typescript
interface SearchPreset {
  id: number;
  doctorId: number;
  name: string;
  filters: {
    query: string;
    doshaType: string[];
    treatmentStatus: string[];
    lastVisitRange: { start: string; end: string } | null;
  };
  createdAt: string;
}
```

### Treatment Outcome Model
```typescript
interface TreatmentOutcome {
  id: number;
  clinicalRecordId: number;
  diagnosis: string;
  vikrutiBefore: { vata: number; pitta: number; kapha: number };
  vikrutiAfter: { vata: number; pitta: number; kapha: number };
  outcome: 'improved' | 'stable' | 'worsened';
  followUpDate: string;
  notes: string;
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Patient Timeline Properties

**Property 1: Timeline Completeness**
*For any* patient with medical records, the timeline should include all clinical records, dosha assessments, Panchakarma treatments, and documents, sorted in chronological order from newest to oldest.
**Validates: Requirements 1.1**

**Property 2: Timeline Entry Format**
*For any* timeline entry, the rendered output should contain a timestamp, record type indicator, and summary information.
**Validates: Requirements 1.2**

**Property 3: Timeline Entry Expansion**
*For any* timeline entry, clicking it should toggle its expanded state, and expanded entries should display all detail fields from the underlying record.
**Validates: Requirements 1.3**

**Property 4: Timeline Filtering**
*For any* combination of date range and record type filters, all displayed timeline entries should fall within the specified date range and match at least one of the selected record types.
**Validates: Requirements 1.4, 1.5**

**Property 5: Panchakarma History Completeness**
*For any* patient with Panchakarma cycles, the timeline should include all cycles with status 'completed' or 'active', along with their stage details.
**Validates: Requirements 1.7**

**Property 6: Document Timeline Inclusion**
*For any* patient with shared medical documents, all documents should appear in the timeline with download links.
**Validates: Requirements 1.8**

### Prescription Management Properties

**Property 7: Medicine Selection Structure**
*For any* medicine selected from the search results, the resulting prescription entry should contain fields for name, dosage, timing, duration, and form.
**Validates: Requirements 2.3**

**Property 8: Prescription Template Round-Trip**
*For any* prescription saved as a template with a given name, loading that template should populate the prescription form with all medicines, pathyam, and apathyam entries from the original prescription.
**Validates: Requirements 2.4, 2.5**

**Property 9: Favorite Medicines Persistence**
*For any* medicine marked as favorite by a doctor, that medicine should appear in the doctor's favorites list and remain there until explicitly removed.
**Validates: Requirements 2.6**

**Property 10: Prescription Copy Fidelity**
*For any* previous prescription, copying it should create a new prescription entry with identical medicines, dosages, timings, durations, and dietary recommendations.
**Validates: Requirements 2.7**

**Property 11: Dietary Recommendation Autocomplete**
*For any* search query in the pathyam or apathyam fields, autocomplete suggestions should only include entries from the pathyam.csv or apathyam.csv database respectively.
**Validates: Requirements 2.8**

**Property 12: PDF Prescription Completeness**
*For any* finalized prescription, the generated PDF should contain sections for clinic branding, doctor details, patient details, all prescribed medicines with dosages, and dietary recommendations (pathyam and apathyam).
**Validates: Requirements 2.9**

**Property 13: Prescription History Ordering**
*For any* patient, their prescription history should be displayed in reverse chronological order (newest first), and search/filter operations should maintain this ordering.
**Validates: Requirements 2.10**

### Follow-up Management Properties

**Property 14: Follow-up Date Suggestion**
*For any* diagnosis entered during clinical entry, the system should suggest a follow-up date that falls within a reasonable range based on the diagnosis type (acute: 3-7 days, chronic: 2-4 weeks, Panchakarma: weekly, post-treatment: 1 month).
**Validates: Requirements 3.1**

**Property 15: Follow-up Notification Creation**
*For any* follow-up reminder created, the system should generate notification records for both the assigned doctor and the patient.
**Validates: Requirements 3.2**

**Property 16: Follow-up List Sorting**
*For any* list of pending follow-ups, they should be sorted first by priority (high, normal, low) and then by due date (earliest first) within each priority level.
**Validates: Requirements 3.3**

**Property 17: Overdue Follow-up Status**
*For any* follow-up with a due date in the past and status 'pending', the system should automatically mark it as 'overdue' and set priority to 'high'.
**Validates: Requirements 3.4**

**Property 18: Follow-up Compliance Calculation**
*For any* patient, their follow-up compliance rate should equal (number of completed follow-ups / total number of follow-ups) × 100, rounded to one decimal place.
**Validates: Requirements 3.5**

**Property 19: Bulk Follow-up Creation**
*For any* set of selected patients, scheduling a bulk follow-up should create individual follow-up records for each patient with the specified due date and notes.
**Validates: Requirements 3.6**

**Property 20: Follow-up Appointment Integration**
*For any* follow-up scheduled, the system should either create an appointment record or provide appointment slot suggestions based on the doctor's availability.
**Validates: Requirements 3.7**

### Clinical Decision Support Properties

**Property 21: Medicine Suggestion Relevance**
*For any* diagnosis and patient Vikruti, medicine suggestions should only include medicines that are mapped to that diagnosis in the disease_medicine_master table or are appropriate for the patient's dosha imbalance.
**Validates: Requirements 4.1**

**Property 22: Drug Interaction Detection**
*For any* pair of medicines in a prescription where a drug interaction exists in the drug_interactions table, the system should display a warning with the interaction severity and description.
**Validates: Requirements 4.2**

**Property 23: Allergy Alert Display**
*For any* patient with recorded allergies, creating or modifying a prescription should display prominent allergy alerts before finalization.
**Validates: Requirements 4.3**

**Property 24: Panchakarma Protocol Recommendation**
*For any* patient with Vikruti imbalance where any dosha score exceeds 60% of total, the system should recommend appropriate Panchakarma protocols for that dosha.
**Validates: Requirements 4.4**

**Property 25: Treatment Outcome Statistics**
*For any* diagnosis entered, if similar cases exist in the treatment_outcomes table, the system should display aggregated statistics including improvement rate, average treatment duration, and common medicine combinations.
**Validates: Requirements 4.5**

### Patient Search Properties

**Property 26: Multi-field Search Coverage**
*For any* search query, results should include patients where the query matches any part of their name, phone number, patient ID, or primary diagnosis (case-insensitive).
**Validates: Requirements 5.1**

**Property 27: Filter Criteria Application**
*For any* combination of dosha type, treatment status, and last visit date range filters, all returned patients should match all applied filter criteria.
**Validates: Requirements 5.2**

**Property 28: Search Preset Round-Trip**
*For any* filter configuration saved as a preset with a given name, loading that preset should apply the exact same filter criteria and produce the same filtered results.
**Validates: Requirements 5.3, 5.4**

**Property 29: Recently Viewed Tracking**
*For any* patient viewed by a doctor, that patient should appear in the doctor's recently viewed list, with the list maintaining the most recent 10 patients in reverse chronological order.
**Validates: Requirements 5.5**

**Property 30: Patient List Health Indicators**
*For any* patient in search results, the displayed information should include current Vikruti status, last visit date, and pending follow-up indicator.
**Validates: Requirements 5.6**

### Appointment Management Properties

**Property 31: Appointment Status Update**
*For any* appointment, updating its status to 'completed', 'cancelled', or 'no-show' should persist the new status and update the appointment's last modified timestamp.
**Validates: Requirements 6.2**

**Property 32: Appointment Notes Persistence**
*For any* appointment, adding or modifying notes should persist the changes and make them retrievable in subsequent views of that appointment.
**Validates: Requirements 6.4**

**Property 33: Appointment Rescheduling**
*For any* appointment rescheduled to a new date/time, the system should update the appointment record and create a notification for the patient with the new schedule details.
**Validates: Requirements 6.5**

**Property 34: Time Slot Blocking**
*For any* time slot marked as blocked by a doctor, that slot should not appear in available booking options for patients and should be visually marked as unavailable in the calendar.
**Validates: Requirements 6.6**

**Property 35: Appointment Statistics Calculation**
*For any* selected time period, appointment statistics should be calculated as: completion rate = (completed / total) × 100, cancellation rate = (cancelled / total) × 100, no-show rate = (no-show / total) × 100, where total includes all appointments in the period.
**Validates: Requirements 6.7**

## Error Handling

### Frontend Error Handling

**Network Errors:**
- All API calls wrapped in try-catch blocks
- Display user-friendly error messages for network failures
- Implement retry logic for transient failures (3 retries with exponential backoff)
- Show offline indicator when backend is unreachable

**Validation Errors:**
- Client-side validation before API calls
- Display inline validation errors for form fields
- Prevent submission of invalid data
- Clear, actionable error messages

**State Management Errors:**
- Graceful degradation when data is unavailable
- Loading states for all async operations
- Empty states with helpful messages
- Error boundaries to catch React component errors

### Backend Error Handling

**Database Errors:**
- Wrap all database operations in try-catch
- Log errors with context (operation, parameters, timestamp)
- Return appropriate HTTP status codes (400, 404, 500)
- Rollback transactions on failure

**Validation Errors:**
- Validate all input parameters
- Return 400 Bad Request with descriptive error messages
- Sanitize inputs to prevent SQL injection
- Check foreign key constraints before operations

**Business Logic Errors:**
- Handle edge cases (e.g., scheduling follow-up for non-existent patient)
- Return meaningful error messages
- Log unexpected conditions for debugging
- Maintain data consistency

**PDF Generation Errors:**
- Handle missing data gracefully (use defaults or placeholders)
- Catch PDFKit errors and return 500 with error message
- Validate prescription data before PDF generation
- Log generation failures for troubleshooting

### Error Recovery Strategies

**Automatic Recovery:**
- Retry failed API calls automatically (with user notification)
- Refresh stale data on focus/visibility change
- Auto-save draft prescriptions to prevent data loss
- Sync offline changes when connection restored

**User-Initiated Recovery:**
- "Retry" buttons for failed operations
- "Refresh" option for stale data
- Clear error state on user action
- Provide alternative workflows when primary fails

## Testing Strategy

### Dual Testing Approach

This feature requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples of timeline filtering (e.g., filter by date range "2024-01-01 to 2024-12-31")
- Edge cases like empty timelines, single-entry timelines, timelines with all record types
- Error conditions like invalid patient IDs, malformed prescription data
- Integration points between components (e.g., follow-up creation triggering notifications)
- PDF generation with various prescription configurations
- Specific drug interaction scenarios

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs (e.g., timeline always sorted chronologically)
- Comprehensive input coverage through randomization
- Round-trip properties (save template → load template → verify equality)
- Invariants (e.g., compliance rate always between 0 and 100)
- Filtering and search correctness across all possible inputs

### Property-Based Testing Configuration

**Library Selection:**
- **JavaScript/TypeScript**: Use `fast-check` library for property-based testing
- Integrate with existing Jest test framework
- Configure each property test to run minimum 100 iterations

**Test Tagging:**
Each property test must include a comment tag referencing the design document property:
```javascript
// Feature: doctor-workflow-enhancements, Property 1: Timeline Completeness
test('timeline includes all record types in chronological order', () => {
  fc.assert(fc.property(
    patientWithRecordsArbitrary(),
    (patient) => {
      const timeline = getPatientTimeline(patient.id);
      // Assert all records present and sorted
    }
  ), { numRuns: 100 });
});
```

**Property Test Implementation:**
- Each correctness property maps to exactly ONE property-based test
- Use custom arbitraries for domain objects (patients, prescriptions, appointments)
- Generate realistic test data (valid dates, dosha scores 0-100, etc.)
- Test both success and failure paths where applicable

### Unit Testing Guidelines

**Balance:**
- Avoid writing too many unit tests for scenarios covered by property tests
- Focus unit tests on specific examples that demonstrate correct behavior
- Use unit tests for integration testing between components
- Test edge cases that are hard to generate randomly

**Coverage Areas:**
- Component rendering with various props
- API endpoint responses for specific inputs
- Database query results for known data
- PDF generation with sample prescriptions
- Notification creation for specific events
- Error handling for known failure modes

**Test Organization:**
- Group tests by component/feature area
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies (database, file system, email)

### Integration Testing

**API Integration:**
- Test complete request/response cycles
- Verify database state changes after operations
- Test authentication and authorization
- Validate error responses

**Component Integration:**
- Test data flow between parent and child components
- Verify event handlers trigger correct actions
- Test modal open/close interactions
- Validate form submission workflows

**End-to-End Scenarios:**
- Complete prescription creation workflow
- Follow-up scheduling and notification flow
- Patient search and selection flow
- Appointment rescheduling with notifications

### Performance Testing

**Response Time:**
- Timeline loading should complete within 2 seconds for patients with up to 100 records
- Medicine search autocomplete should respond within 500ms
- PDF generation should complete within 3 seconds for prescriptions with up to 20 medicines
- Patient search should return results within 1 second for databases with up to 10,000 patients

**Load Testing:**
- Test concurrent prescription creation by multiple doctors
- Verify database performance with large datasets
- Test notification system under high load
- Monitor memory usage during long sessions

**Optimization Targets:**
- Implement pagination for large result sets
- Cache frequently accessed data (medicine database, treatment guidelines)
- Use database indexes on frequently queried fields
- Optimize SQL queries with EXPLAIN analysis

## Implementation Notes

### Phase 1: Foundation (Database and API)
1. Create new database tables (prescription_templates, follow_ups, favorite_medicines, search_presets, drug_interactions, treatment_outcomes)
2. Implement API endpoints for each feature area
3. Add database indexes for performance
4. Implement basic error handling and validation

### Phase 2: Core Components
1. Build PatientTimelineView component with filtering
2. Enhance PrescriptionBuilder with templates and favorites
3. Create FollowUpManager component
4. Implement ClinicalDecisionSupport component

### Phase 3: Search and Calendar
1. Build AdvancedPatientSearch with filters and presets
2. Create AppointmentCalendar with day/week views
3. Implement appointment status management
4. Add statistics dashboard

### Phase 4: Integration and Polish
1. Integrate all components with existing dashboard
2. Implement PDF generation
3. Add notification triggers
4. Perform end-to-end testing

### Phase 5: Testing and Optimization
1. Write property-based tests for all properties
2. Write unit tests for edge cases
3. Perform performance testing and optimization
4. User acceptance testing with doctors

### Migration Strategy

**Database Migration:**
- Create migration script to add new tables
- Add new columns to existing tables with ALTER TABLE
- Populate drug_interactions table with common Ayurvedic medicine interactions
- Seed treatment guidelines data

**Data Seeding:**
- Import drug interactions from curated CSV file
- Add common prescription templates for reference
- Populate treatment outcome statistics from historical data
- Add Ayurvedic treatment guidelines as markdown files

**Backward Compatibility:**
- All new columns have default values
- Existing API endpoints remain unchanged
- New features are additive, not breaking
- Graceful degradation if new tables are empty

### Security Considerations

**Authentication:**
- All API endpoints require valid JWT token
- Verify doctor role for doctor-specific endpoints
- Validate doctor can only access their own data (templates, favorites, presets)

**Authorization:**
- Doctors can only view patients they have treated
- Prescription templates are private to each doctor
- Follow-ups can only be created by authorized doctors
- Appointment modifications require doctor ownership

**Data Privacy:**
- Sanitize all user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Encrypt sensitive data in database (if required by regulations)
- Audit log all prescription and clinical record access

**Rate Limiting:**
- Implement rate limiting on search endpoints (10 requests/second)
- Limit PDF generation requests (5 per minute per doctor)
- Throttle notification sending to prevent spam
- Monitor for suspicious activity patterns

### Accessibility Considerations

**Keyboard Navigation:**
- All interactive elements accessible via keyboard
- Logical tab order through forms
- Keyboard shortcuts for common actions (Ctrl+S to save prescription)
- Focus indicators visible on all focusable elements

**Screen Reader Support:**
- Semantic HTML elements (button, nav, main, etc.)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content updates
- Alt text for all images and icons

**Visual Accessibility:**
- Sufficient color contrast (WCAG AA minimum)
- Text resizable up to 200% without loss of functionality
- No information conveyed by color alone
- Focus indicators meet contrast requirements

**Responsive Design:**
- Mobile-friendly layouts for all components
- Touch targets minimum 44x44 pixels
- Responsive tables with horizontal scroll
- Collapsible sections for small screens
