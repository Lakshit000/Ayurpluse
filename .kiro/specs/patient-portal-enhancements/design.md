# Design Document: Patient Portal Enhancements

## Overview

The Patient Portal Enhancements feature extends AyurPulse's existing patient portal with five major capability areas: advanced prescription management, enhanced notifications, medical report management, secure patient-doctor communication, and a centralized health document vault.

**Current Implementation Status:**
- ✅ Database schema is FULLY IMPLEMENTED in `server/server.js` (all tables and indexes created)
- ✅ Database tables: prescriptions, prescription_medications, notification_preferences, medical_reports, messages, document_vault, document_shares
- ✅ Enhanced notifications table with additional columns
- ⚠️ PatientRecords.jsx exists but is a placeholder ("Work in Progress")
- ❌ PatientNotifications.jsx - needs to be created
- ❌ PatientReports.jsx - needs to be created
- ❌ PatientMessages.jsx - needs to be created
- ❌ PatientVault.jsx - needs to be created
- ❌ API endpoints in server.js - need to be implemented

**Implementation Focus:**
This design focuses on building the frontend React components and backend API endpoints. The database foundation is already in place, so implementation can proceed directly to building the user interface and connecting it to the database through RESTful APIs.

The enhancement maintains AyurPulse's Ayurvedic healthcare focus while providing modern digital health management capabilities. All new features follow the established patterns: role-based component organization, RESTful API design, and Tailwind CSS styling with the custom Ayurvedic color palette.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Patient Portal (React)                    │
├─────────────────────────────────────────────────────────────┤
│  PatientRecords  │  Notifications  │  Messages  │  Vault    │
│  (TO BUILD)      │  (TO BUILD)     │  (TO BUILD)│  (TO BUILD)│
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Express API Layer                          │
├─────────────────────────────────────────────────────────────┤
│  /api/patient/prescriptions  │  /api/patient/notifications  │
│  /api/patient/reports        │  /api/patient/messages       │
│  /api/patient/vault          │  (TO IMPLEMENT)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                           │
├─────────────────────────────────────────────────────────────┤
│  prescriptions  │  medical_reports  │  messages             │
│  notification_preferences  │  document_vault  │  ✅ CREATED │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    File Storage System                       │
├─────────────────────────────────────────────────────────────┤
│  server/uploads/prescriptions/  │  server/uploads/reports/  │
│  server/uploads/documents/      │  (TO CREATE)              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Integration

- **Frontend**: New React components in `src/components/patient/` directory
  - PatientRecords.jsx currently exists as placeholder - needs full implementation
  - PatientNotifications.jsx, PatientReports.jsx, PatientMessages.jsx, PatientVault.jsx need to be created
- **Backend**: New API routes to be added in `server/server.js` following existing patterns
- **Database**: ✅ All tables already created via `createPatientPortalTables()` function
- **File Storage**: Local filesystem storage in `server/uploads/` - directories need to be created
- **PDF Generation**: PDFKit (already available) for prescription and report generation
- **Email**: Nodemailer (already configured) for sending documents and notifications
- **Authentication**: Existing JWT-based auth middleware for all new endpoints

### Implementation Priorities

1. **Phase 1: Core Components** - Build the four main React components with basic functionality
2. **Phase 2: API Endpoints** - Implement all backend routes to connect components to database
3. **Phase 3: File Operations** - Add file upload, download, and PDF generation capabilities
4. **Phase 4: Advanced Features** - Email delivery, notifications scheduling, search/filter

## Components and Interfaces

### Frontend Components

#### 1. PatientRecords.jsx (Enhanced)

Replaces the current placeholder component with full prescription management capabilities.

**Component Structure:**
```jsx
PatientRecords
├── PrescriptionList (main view)
│   ├── SearchBar (date, doctor, medicine filters)
│   ├── PrescriptionCard (individual prescription display)
│   │   ├── PrescriptionHeader (date, doctor, status)
│   │   ├── MedicationList (medicines with dosage)
│   │   └── ActionButtons (download, email, print)
│   └── PrescriptionModal (detailed view)
└── EmptyState (when no prescriptions)
```

**Key Features:**
- Search and filter functionality with debounced input
- Download as PDF or PNG image
- Email prescription dialog with recipient input
- Print-optimized view (CSS media queries)
- Pagination for large prescription lists

**State Management:**
```javascript
const [prescriptions, setPrescriptions] = useState([]);
const [filters, setFilters] = useState({ date: '', doctor: '', medicine: '' });
const [selectedPrescription, setSelectedPrescription] = useState(null);
const [emailDialog, setEmailDialog] = useState({ open: false, prescription: null });
```

#### 2. PatientNotifications.jsx (New Component)

Comprehensive notification management interface.

**Component Structure:**
```jsx
PatientNotifications
├── NotificationSettings (preferences panel)
│   ├── ChannelToggles (email, in-app, SMS)
│   ├── ReminderSettings (medication, appointment, follow-up)
│   └── SaveButton
├── NotificationList (history view)
│   ├── NotificationCard (individual notification)
│   │   ├── NotificationIcon (type-based icon)
│   │   ├── NotificationContent (message, timestamp)
│   │   └── ReadStatus (read/unread indicator)
│   └── FilterTabs (all, unread, read)
└── EmptyState
```

**State Management:**
```javascript
const [preferences, setPreferences] = useState({
  email: true, inApp: true, sms: false,
  medicationReminders: true, appointmentReminders: true, followUpReminders: true
});
const [notifications, setNotifications] = useState([]);
const [filter, setFilter] = useState('all'); // all, unread, read
```

#### 3. PatientReports.jsx (New Component)

Medical report upload, organization, and sharing interface.

**Component Structure:**
```jsx
PatientReports
├── UploadSection
│   ├── FileDropzone (drag-and-drop upload)
│   ├── CategorySelector (lab, imaging, consultation)
│   └── UploadButton
├── ReportGrid (organized display)
│   ├── CategoryTabs (all, lab, imaging, consultation)
│   ├── ReportCard (individual report)
│   │   ├── ReportThumbnail (file type icon or preview)
│   │   ├── ReportMetadata (name, date, category)
│   │   └── ActionMenu (download, share, delete)
│   └── SearchBar
└── ShareDialog (doctor selection for sharing)
```

**State Management:**
```javascript
const [reports, setReports] = useState([]);
const [uploading, setUploading] = useState(false);
const [selectedCategory, setSelectedCategory] = useState('all');
const [shareDialog, setShareDialog] = useState({ open: false, report: null });
const [searchQuery, setSearchQuery] = useState('');
```

#### 4. PatientMessages.jsx (New Component)

Secure messaging interface with doctors.

**Component Structure:**
```jsx
PatientMessages
├── ConversationList (sidebar)
│   ├── DoctorCard (each doctor conversation)
│   │   ├── DoctorAvatar
│   │   ├── LastMessage (preview)
│   │   └── UnreadBadge
│   └── NewMessageButton
├── MessageThread (main area)
│   ├── MessageHeader (doctor info)
│   ├── MessageList (scrollable conversation)
│   │   ├── MessageBubble (individual message)
│   │   │   ├── MessageContent
│   │   │   ├── Timestamp
│   │   │   └── Attachment (if any)
│   │   └── DateSeparator
│   └── MessageInput
│       ├── TextArea
│       ├── AttachmentButton (prescriptions, reports)
│       ├── RefillRequestButton
│       └── SendButton
└── EmptyState (no conversations)
```

**State Management:**
```javascript
const [conversations, setConversations] = useState([]);
const [selectedDoctor, setSelectedDoctor] = useState(null);
const [messages, setMessages] = useState([]);
const [messageInput, setMessageInput] = useState('');
const [attachments, setAttachments] = useState([]);
```

#### 5. PatientVault.jsx (New Component)

Centralized health document management system.

**Component Structure:**
```jsx
PatientVault
├── VaultHeader
│   ├── SearchBar (filename, tags, categories)
│   ├── UploadButton
│   └── ViewToggle (grid/list)
├── DocumentGrid
│   ├── CategoryFilter (sidebar)
│   │   ├── AllDocuments
│   │   ├── Prescriptions
│   │   ├── MedicalReports
│   │   ├── LabResults
│   │   └── CustomTags
│   └── DocumentCard
│       ├── DocumentPreview (icon or thumbnail)
│       ├── DocumentInfo (name, date, size, tags)
│       ├── ExpiryIndicator (if applicable)
│       └── ActionMenu (view, download, edit tags, delete)
├── DocumentDetailModal
│   ├── DocumentViewer (PDF/image viewer)
│   ├── MetadataPanel (tags, category, expiry)
│   └── ActionButtons
└── TagManagementDialog
```

**State Management:**
```javascript
const [documents, setDocuments] = useState([]);
const [selectedCategory, setSelectedCategory] = useState('all');
const [searchQuery, setSearchQuery] = useState('');
const [viewMode, setViewMode] = useState('grid'); // grid or list
const [selectedDocument, setSelectedDocument] = useState(null);
const [tags, setTags] = useState([]);
```

### Backend API Endpoints

**Implementation Note:** All endpoints below need to be implemented in `server/server.js`. The database tables are already created, so these endpoints will primarily focus on CRUD operations, file handling, and business logic.

#### Prescription Management APIs

```javascript
// Get all prescriptions for a patient with optional filters
GET /api/patient/prescriptions/:userId?date=&doctor=&medicine=
Response: { prescriptions: [...], total: number }
Implementation: Query prescriptions table with JOIN to prescription_medications for medicine filter

// Get single prescription details
GET /api/patient/prescriptions/:userId/:prescriptionId
Response: { prescription: {...}, medications: [...] }
Implementation: Query prescriptions and prescription_medications tables

// Download prescription as PDF
GET /api/patient/prescriptions/:userId/:prescriptionId/download?format=pdf
Response: PDF file stream
Implementation: Use PDFKit to generate prescription PDF with Ayurvedic styling

// Download prescription as image
GET /api/patient/prescriptions/:userId/:prescriptionId/download?format=image
Response: PNG file stream
Implementation: Generate PDF first, then convert to PNG using Jimp

// Email prescription
POST /api/patient/prescriptions/:userId/:prescriptionId/email
Body: { recipientEmail: string, format: 'pdf' | 'image' }
Response: { success: boolean, message: string }
Implementation: Generate file, use nodemailer to send email
```

#### Notification APIs

```javascript
// Get notification preferences
GET /api/patient/notifications/:userId/preferences
Response: { preferences: {...} }
Implementation: Query notification_preferences table, create default if not exists

// Update notification preferences
PUT /api/patient/notifications/:userId/preferences
Body: { email: boolean, inApp: boolean, sms: boolean, ... }
Response: { success: boolean, preferences: {...} }
Implementation: UPDATE notification_preferences table

// Get notification history
GET /api/patient/notifications/:userId?filter=all|read|unread
Response: { notifications: [...], unreadCount: number }
Implementation: Query notifications table with filter on is_read column

// Mark notification as read
PUT /api/patient/notifications/:userId/:notificationId/read
Response: { success: boolean }
Implementation: UPDATE notifications SET is_read=1, read_at=CURRENT_TIMESTAMP

// Mark all notifications as read
PUT /api/patient/notifications/:userId/read-all
Response: { success: boolean }
Implementation: UPDATE all user's notifications to is_read=1
```

#### Medical Report APIs

```javascript
// Upload medical report
POST /api/patient/reports/:userId/upload
Body: FormData { file: File, category: string, tags: string[] }
Response: { success: boolean, report: {...} }
Implementation: Save file to server/uploads/reports/{userId}/, INSERT into medical_reports

// Get all reports with filters
GET /api/patient/reports/:userId?category=&search=
Response: { reports: [...], total: number }
Implementation: Query medical_reports with WHERE clauses for filters

// Download report
GET /api/patient/reports/:userId/:reportId/download
Response: File stream (original format)
Implementation: Read file from file_path, stream to response

// Share report with doctor
POST /api/patient/reports/:userId/:reportId/share
Body: { doctorId: number }
Response: { success: boolean, message: string }
Implementation: INSERT into document_shares, UPDATE medical_reports.shared_with JSON

// Delete report
DELETE /api/patient/reports/:userId/:reportId
Response: { success: boolean }
Implementation: DELETE from medical_reports, remove file from filesystem

// Update report metadata
PUT /api/patient/reports/:userId/:reportId
Body: { category: string, tags: string[] }
Response: { success: boolean, report: {...} }
Implementation: UPDATE medical_reports SET category, tags
```

#### Messaging APIs

```javascript
// Get all conversations for a patient
GET /api/patient/messages/:userId/conversations
Response: { conversations: [{ doctorId, doctorName, lastMessage, unreadCount }] }
Implementation: Query messages with GROUP BY, JOIN users for doctor names

// Get messages with a specific doctor
GET /api/patient/messages/:userId/doctor/:doctorId
Response: { messages: [...], doctor: {...} }
Implementation: Query messages WHERE (sender_id=userId AND recipient_id=doctorId) OR vice versa

// Send message to doctor
POST /api/patient/messages/:userId/send
Body: { doctorId: number, content: string, attachments: [], isRefillRequest: boolean }
Response: { success: boolean, message: {...} }
Implementation: INSERT into messages, create notification for doctor

// Mark conversation as read
PUT /api/patient/messages/:userId/doctor/:doctorId/read
Response: { success: boolean }
Implementation: UPDATE messages SET is_read=1 WHERE recipient_id=userId AND sender_id=doctorId
```

#### Document Vault APIs

```javascript
// Get all vault documents
GET /api/patient/vault/:userId?category=&search=&tags=
Response: { documents: [...], categories: [...], tags: [...] }
Implementation: Query document_vault with filters, extract unique categories and tags

// Upload document to vault
POST /api/patient/vault/:userId/upload
Body: FormData { file: File, category: string, tags: string[], expiryDate: string }
Response: { success: boolean, document: {...} }
Implementation: Save to server/uploads/documents/{userId}/, INSERT into document_vault

// Update document metadata
PUT /api/patient/vault/:userId/:documentId
Body: { tags: string[], category: string, expiryDate: string }
Response: { success: boolean, document: {...} }
Implementation: UPDATE document_vault SET tags, category, expiry_date

// Delete document from vault
DELETE /api/patient/vault/:userId/:documentId
Response: { success: boolean }
Implementation: DELETE from document_vault, remove file from filesystem

// Get document tags
GET /api/patient/vault/:userId/tags
Response: { tags: [...] }
Implementation: Query document_vault, extract and deduplicate all tags from JSON arrays
```

## Data Models

### Database Schema

**Implementation Status:** ✅ All tables below are ALREADY CREATED in `server/server.js` via the `createPatientPortalTables()` function. No database schema changes are needed.

The following tables exist and are ready to use:

#### 1. prescriptions Table

Stores prescription metadata (actual prescription data comes from clinical_records).

```sql
CREATE TABLE prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    clinical_record_id INTEGER,
    prescription_date TEXT NOT NULL,
    diagnosis TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id),
    FOREIGN KEY (clinical_record_id) REFERENCES clinical_records(id)
);
```

#### 2. prescription_medications Table

Links prescriptions to medications with dosage details.

```sql
CREATE TABLE prescription_medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prescription_id INTEGER NOT NULL,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    instructions TEXT,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);
```

#### 3. notification_preferences Table

Stores user notification preferences.

```sql
CREATE TABLE notification_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    email_enabled INTEGER DEFAULT 1,
    in_app_enabled INTEGER DEFAULT 1,
    sms_enabled INTEGER DEFAULT 0,
    medication_reminders INTEGER DEFAULT 1,
    appointment_reminders INTEGER DEFAULT 1,
    followup_reminders INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4. notifications Table (Enhanced)

Extended with additional columns via `enhanceNotificationsTable()` function.

```sql
-- Base table already exists, enhanced with:
ALTER TABLE notifications ADD COLUMN notification_type TEXT DEFAULT 'general';
ALTER TABLE notifications ADD COLUMN scheduled_for TEXT;
ALTER TABLE notifications ADD COLUMN sent_at TEXT;
ALTER TABLE notifications ADD COLUMN delivery_status TEXT DEFAULT 'pending';
ALTER TABLE notifications ADD COLUMN metadata TEXT; -- JSON string for additional data
```

#### 5. medical_reports Table

Stores uploaded medical reports and test results.

```sql
CREATE TABLE medical_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    category TEXT NOT NULL, -- 'lab', 'imaging', 'consultation'
    tags TEXT, -- JSON array of tags
    upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
    report_date TEXT,
    shared_with TEXT, -- JSON array of doctor IDs
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 6. messages Table

Stores patient-doctor secure messages.

```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    sender_role TEXT NOT NULL, -- 'patient' or 'doctor'
    content TEXT NOT NULL,
    attachments TEXT, -- JSON array of attachment references
    is_refill_request INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    read_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (recipient_id) REFERENCES users(id)
);

-- Indexes created via createPatientPortalIndexes()
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, is_read);
```

#### 7. document_vault Table

Centralized storage for all patient health documents.

```sql
CREATE TABLE document_vault (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    document_type TEXT NOT NULL, -- 'prescription', 'report', 'lab', 'general'
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    category TEXT,
    tags TEXT, -- JSON array
    expiry_date TEXT,
    is_expired INTEGER DEFAULT 0,
    upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON for additional fields
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes created via createPatientPortalIndexes()
CREATE INDEX idx_vault_patient ON document_vault(patient_id);
CREATE INDEX idx_vault_expiry ON document_vault(expiry_date, is_expired);
```

#### 8. document_shares Table

Tracks document sharing with doctors.

```sql
CREATE TABLE document_shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    document_source TEXT NOT NULL, -- 'vault', 'report', 'prescription'
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    shared_at TEXT DEFAULT CURRENT_TIMESTAMP,
    access_revoked INTEGER DEFAULT 0,
    revoked_at TEXT,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Index created via createPatientPortalIndexes()
CREATE INDEX idx_shares_doctor ON document_shares(doctor_id, access_revoked);
```

### File Storage Structure

```
server/uploads/
├── prescriptions/
│   ├── {patient_id}/
│   │   ├── {prescription_id}_pdf.pdf
│   │   └── {prescription_id}_img.png
├── reports/
│   ├── {patient_id}/
│   │   ├── {report_id}_{original_filename}
│   │   └── ...
├── documents/
│   ├── {patient_id}/
│   │   ├── {document_id}_{original_filename}
│   │   └── ...
└── message_attachments/
    ├── {user_id}/
    │   ├── {message_id}_{filename}
    │   └── ...
```

**File Naming Convention:**
- Format: `{id}_{timestamp}_{sanitized_original_name}.{ext}`
- Example: `123_1704067200000_lab_report.pdf`

**Security Measures:**
- All file paths stored in database are relative to upload root
- File access requires authentication and ownership verification
- Sanitize filenames to prevent directory traversal attacks
- Validate file types using MIME type checking
- Implement file size limits (10MB for reports, 5MB for documents)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Prescription Download Format Availability

*For any* prescription in the system, when a patient selects it, download options for both PDF and image formats should be available in the UI.

**Validates: Requirements 1.1**

### Property 2: Prescription Email Delivery

*For any* prescription and valid email address, when a patient requests to email the prescription in a chosen format, the system should successfully send the email with the prescription in the specified format.

**Validates: Requirements 1.2**

### Property 3: Print View Navigation Removal

*For any* prescription, when rendered in print view, the output should not contain navigation elements (headers, sidebars, buttons) that are present in the normal view.

**Validates: Requirements 1.3**

### Property 4: Prescription Filtering Correctness

*For any* filter criteria (date range, doctor name, or medicine name), all returned prescriptions should match the filter criteria, and no matching prescriptions should be excluded.

**Validates: Requirements 1.4, 1.5, 1.6**

### Property 5: Medication Reminder Scheduling

*For any* medication with prescribed dosage times, when medication reminders are enabled, the system should create scheduled notifications for each dosage time.

**Validates: Requirements 2.2**

### Property 6: Appointment Reminder Creation

*For any* scheduled appointment, the system should automatically create exactly two reminder notifications: one scheduled for 24 hours before and one for 1 hour before the appointment time.

**Validates: Requirements 2.3**

### Property 7: Follow-up Reminder Delivery

*For any* follow-up care action with a due date, the system should create a reminder notification scheduled for the due date.

**Validates: Requirements 2.4**

### Property 8: Notification Status Display

*For any* notification in the system, when displayed in the notification history, it should include a visual indicator showing whether it is read or unread.

**Validates: Requirements 2.5**

### Property 9: Notification Read Status Update

*For any* notification, when marked as read by a patient, the notification's status should immediately update to "read" and the read timestamp should be recorded.

**Validates: Requirements 2.6**

### Property 10: Notification Channel Filtering

*For any* notification channel that is disabled in preferences, no notifications should be sent through that channel regardless of notification type.

**Validates: Requirements 2.7**

### Property 11: Report Upload and Association

*For any* valid medical report file uploaded by a patient, the system should store the file and create a database record associating it with the patient's account.

**Validates: Requirements 3.1**

### Property 12: Report Download Round-Trip

*For any* medical report, downloading the report after upload should return a file with the same content and format as the original uploaded file.

**Validates: Requirements 3.2**

### Property 13: Report Categorization

*For any* medical report and selected category (lab, imaging, or consultation), assigning the category should update the report's category field to the selected value.

**Validates: Requirements 3.3**

### Property 14: Report Sharing Access Grant

*For any* medical report and doctor, when a patient shares the report with the doctor, the doctor should be able to access the report through their account.

**Validates: Requirements 3.4**

### Property 15: Document Search Accuracy

*For any* search query across reports or vault documents, all returned results should contain the search query in either the filename, tags, or category fields.

**Validates: Requirements 3.5, 5.3**

### Property 16: Message Encryption and Delivery

*For any* message sent from a patient to a doctor, the message content should be encrypted before storage and successfully delivered to the doctor's inbox.

**Validates: Requirements 4.1**

### Property 17: Message Reply Notification

*For any* message reply from a doctor to a patient, a notification should be created and sent to the patient indicating a new message has arrived.

**Validates: Requirements 4.2**

### Property 18: Message Threading

*For any* conversation between a patient and doctor, when viewing message history, all messages should be grouped by conversation and displayed in chronological order.

**Validates: Requirements 4.3**

### Property 19: Refill Request Flagging

*For any* message marked as a prescription refill request, the message should have a flag or metadata indicating it requires doctor review for refill.

**Validates: Requirements 4.4**

### Property 20: Prescription Attachment Support

*For any* message about a prescription, the system should allow attaching a reference to the prescription, and the attachment should be accessible in the message thread.

**Validates: Requirements 4.5**

### Property 21: Message History Retention

*For any* message in the system, it should remain accessible and retrievable for at least 12 months from its creation date.

**Validates: Requirements 4.6**

### Property 22: Document Vault Metadata Storage

*For any* document uploaded to the vault, the system should store metadata including upload date, file type, file size, and original filename.

**Validates: Requirements 5.1**

### Property 23: Document Tag Round-Trip

*For any* document and set of tags, adding tags to the document and then retrieving the document should return the same set of tags.

**Validates: Requirements 5.2**

### Property 24: Document Expiry Notification

*For any* document with an expiry date, when the current date reaches or passes the expiry date, a notification should be created to inform the patient.

**Validates: Requirements 5.4**

### Property 25: Document Category Organization

*For any* set of documents in the vault, when displayed, documents should be grouped by their assigned category with visual indicators showing document type.

**Validates: Requirements 5.5**

### Property 26: Document Deletion Completeness

*For any* document in the vault, when deleted, both the file and all associated database records (metadata, tags, shares) should be removed from the system.

**Validates: Requirements 5.6**

### Property 27: File Type Validation

*For any* file upload attempt, if the file type is not in the allowed list of medical document formats, the upload should be rejected with an error message.

**Validates: Requirements 6.1**

### Property 28: Document Share Audit Logging

*For any* document sharing action, an audit log entry should be created recording the patient ID, doctor ID, document ID, and timestamp of the share.

**Validates: Requirements 6.2**

### Property 29: Document Access Authentication

*For any* attempt to access a document, the system should validate that the user has an active authenticated session and ownership or shared access to the document.

**Validates: Requirements 6.3**

### Property 30: Data Encryption at Rest

*For any* sensitive data (documents, messages, reports) stored in the system, the data should be encrypted using a secure encryption algorithm before being written to storage.

**Validates: Requirements 6.4, 6.5**

### Property 31: Session Expiry Cleanup

*For any* patient session, when the session expires, the system should automatically log out the user and clear any cached sensitive data from client-side storage.

**Validates: Requirements 6.6**

### Property 32: Upload Failure Error Handling

*For any* file upload that fails due to network or server error, the system should display a clear error message and allow the user to retry the upload without losing the selected file.

**Validates: Requirements 7.5**

### Property 33: Email Service Resilience

*For any* notification that fails to send due to email service unavailability, the notification should be queued for retry and successfully sent when the service is restored.

**Validates: Requirements 7.6**

### Property 34: Error Message Clarity

*For any* error condition encountered by a patient, the system should display an error message that is user-friendly (non-technical language) and includes suggested next steps or actions.

**Validates: Requirements 8.2**

## Error Handling

### File Upload Errors

**Error Scenarios:**
1. **File too large**: Files exceeding size limits (10MB for reports, 5MB for documents)
2. **Invalid file type**: Files with disallowed MIME types or extensions
3. **Storage failure**: Disk space exhausted or filesystem errors
4. **Network interruption**: Upload interrupted mid-transfer

**Handling Strategy:**
```javascript
try {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('FILE_TOO_LARGE');
  }
  
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('INVALID_FILE_TYPE');
  }
  
  // Attempt upload
  await uploadFile(file);
  
} catch (error) {
  // Map error to user-friendly message
  const userMessage = ERROR_MESSAGES[error.message] || 'Upload failed. Please try again.';
  
  // Log error for debugging
  logError(error, { userId, fileName: file.name });
  
  // Return error to user with retry option
  return { success: false, message: userMessage, canRetry: true };
}
```

### Database Errors

**Error Scenarios:**
1. **Connection failure**: Database unavailable or connection timeout
2. **Constraint violation**: Unique constraint or foreign key violations
3. **Query timeout**: Long-running queries exceeding timeout limits
4. **Disk full**: Database cannot write due to storage constraints

**Handling Strategy:**
- Implement connection pooling with retry logic
- Use transactions for multi-step operations
- Provide graceful degradation (read-only mode if writes fail)
- Log all database errors with context for debugging
- Return user-friendly messages without exposing database details

### Email Delivery Errors

**Error Scenarios:**
1. **SMTP server unavailable**: Email service down or unreachable
2. **Invalid recipient**: Email address format invalid or domain doesn't exist
3. **Rate limiting**: Too many emails sent in short period
4. **Authentication failure**: SMTP credentials invalid or expired

**Handling Strategy:**
```javascript
async function sendEmail(to, subject, content) {
  try {
    await transporter.sendMail({ to, subject, html: content });
    return { success: true };
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      // Queue for retry
      await queueEmail({ to, subject, content, retryCount: 0 });
      return { success: false, queued: true, message: 'Email queued for delivery' };
    }
    
    // Log error and return failure
    logError(error, { to, subject });
    return { success: false, message: 'Failed to send email' };
  }
}
```

### Authentication Errors

**Error Scenarios:**
1. **Session expired**: JWT token expired or invalid
2. **Unauthorized access**: User attempting to access another user's data
3. **Missing credentials**: No authentication token provided
4. **Invalid token**: Token tampered with or malformed

**Handling Strategy:**
- Middleware to validate JWT on all protected routes
- Return 401 Unauthorized for expired/invalid tokens
- Return 403 Forbidden for insufficient permissions
- Automatically redirect to login on authentication failure
- Clear client-side tokens on logout or expiry

### File System Errors

**Error Scenarios:**
1. **Permission denied**: Insufficient permissions to read/write files
2. **File not found**: Attempting to access deleted or moved file
3. **Disk full**: No space available for new files
4. **Path traversal attempt**: Malicious filename attempting directory traversal

**Handling Strategy:**
```javascript
// Sanitize filenames
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Remove special chars
    .replace(/\.{2,}/g, '.')            // Remove multiple dots
    .substring(0, 255);                 // Limit length
}

// Validate file path
function validateFilePath(filePath) {
  const normalized = path.normalize(filePath);
  const uploadDir = path.resolve('./uploads');
  
  if (!normalized.startsWith(uploadDir)) {
    throw new Error('INVALID_PATH');
  }
  
  return normalized;
}
```

## Testing Strategy

### Dual Testing Approach

The Patient Portal Enhancements will be validated using both unit tests and property-based tests, which are complementary and necessary for comprehensive coverage:

**Unit Tests** focus on:
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, special characters)
- Error conditions and error message content
- Integration points between components
- API endpoint responses for specific scenarios

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Invariants that must be maintained across operations
- Round-trip properties (upload/download, serialize/deserialize)
- Filtering and search correctness across random data sets

### Property-Based Testing Configuration

**Library Selection:**
- **JavaScript/Node.js**: Use `fast-check` library for property-based testing
- Installation: `npm install --save-dev fast-check`

**Test Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: patient-portal-enhancements, Property {number}: {property_text}`

**Example Property Test Structure:**
```javascript
import fc from 'fast-check';

describe('Patient Portal Enhancements - Property Tests', () => {
  
  // Feature: patient-portal-enhancements, Property 4: Prescription Filtering Correctness
  test('Property 4: All filtered prescriptions match filter criteria', () => {
    fc.assert(
      fc.property(
        fc.array(prescriptionArbitrary),  // Generate random prescriptions
        fc.oneof(fc.date(), fc.string(), fc.string()),  // Random filter
        (prescriptions, filter) => {
          const filtered = filterPrescriptions(prescriptions, filter);
          return filtered.every(p => matchesFilter(p, filter));
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: patient-portal-enhancements, Property 12: Report Download Round-Trip
  test('Property 12: Downloaded report matches uploaded report', async () => {
    fc.assert(
      fc.asyncProperty(
        fc.uint8Array({ minLength: 100, maxLength: 1000 }),  // Random file content
        fc.constantFrom('application/pdf', 'image/jpeg', 'image/png'),  // Random type
        async (fileContent, mimeType) => {
          const uploadResult = await uploadReport(fileContent, mimeType);
          const downloadResult = await downloadReport(uploadResult.reportId);
          
          return (
            Buffer.compare(fileContent, downloadResult.content) === 0 &&
            downloadResult.mimeType === mimeType
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Test Organization:**
```
tests/
├── unit/
│   ├── prescriptions.test.js
│   ├── notifications.test.js
│   ├── reports.test.js
│   ├── messages.test.js
│   └── vault.test.js
├── integration/
│   ├── prescription-workflow.test.js
│   ├── notification-delivery.test.js
│   └── document-sharing.test.js
└── property/
    ├── filtering.property.test.js
    ├── roundtrip.property.test.js
    └── security.property.test.js
```

**Key Unit Test Examples:**

1. **Prescription Email - Specific Example**
```javascript
test('should email prescription as PDF to valid address', async () => {
  const prescription = createTestPrescription();
  const result = await emailPrescription(prescription.id, 'patient@example.com', 'pdf');
  
  expect(result.success).toBe(true);
  expect(mockEmailService.sendMail).toHaveBeenCalledWith(
    expect.objectContaining({
      to: 'patient@example.com',
      attachments: expect.arrayContaining([
        expect.objectContaining({ filename: expect.stringMatching(/\.pdf$/) })
      ])
    })
  );
});
```

2. **File Type Validation - Edge Cases**
```javascript
test('should reject files with executable extensions', async () => {
  const maliciousFiles = ['.exe', '.sh', '.bat', '.cmd'];
  
  for (const ext of maliciousFiles) {
    const file = createMockFile(`malicious${ext}`);
    const result = await uploadReport(file);
    
    expect(result.success).toBe(false);
    expect(result.message).toContain('file type not allowed');
  }
});
```

3. **Notification Preferences - Integration**
```javascript
test('should respect disabled notification channels', async () => {
  await updateNotificationPreferences(userId, { email: false, inApp: true });
  
  await createAppointmentReminder(userId, appointmentId);
  
  expect(mockEmailService.sendMail).not.toHaveBeenCalled();
  expect(await getInAppNotifications(userId)).toHaveLength(1);
});
```

### Testing Coverage Goals

- **Unit Test Coverage**: Minimum 80% code coverage for business logic
- **Property Test Coverage**: All 34 correctness properties implemented as property tests
- **Integration Test Coverage**: All major workflows (prescription download, report sharing, messaging)
- **Error Handling Coverage**: All error scenarios documented in Error Handling section

### Continuous Integration

- Run all tests on every commit
- Property tests run with 100 iterations in CI
- Integration tests run against test database
- Coverage reports generated and tracked over time
- Fail build if coverage drops below threshold

## Implementation Notes

### Phase 1: Database and File Storage Setup
1. Create new database tables via migration script
2. Set up file storage directory structure with proper permissions
3. Implement file upload middleware with validation
4. Add database indexes for performance

### Phase 2: Backend API Development
1. Implement prescription management endpoints
2. Implement notification system endpoints
3. Implement medical report endpoints
4. Implement messaging endpoints
5. Implement document vault endpoints
6. Add authentication middleware to all endpoints

### Phase 3: Frontend Component Development
1. Enhance PatientRecords component with prescription management
2. Create PatientNotifications component
3. Create PatientReports component
4. Create PatientMessages component
5. Create PatientVault component
6. Update PatientDashboard navigation to include new features

### Phase 4: Integration and Testing
1. Write unit tests for all API endpoints
2. Write property-based tests for all correctness properties
3. Perform integration testing of complete workflows
4. Conduct security testing (authentication, authorization, file validation)
5. Perform accessibility testing

### Phase 5: Polish and Deployment
1. Add loading states and error handling to all components
2. Implement responsive design for mobile devices
3. Add animations and transitions using Framer Motion
4. Optimize database queries and add caching where appropriate
5. Deploy to production environment

### Security Considerations

1. **File Upload Security**:
   - Validate MIME types using magic number detection, not just extensions
   - Scan uploaded files for malware (integrate with antivirus if available)
   - Store files outside web root to prevent direct access
   - Generate random filenames to prevent enumeration attacks

2. **Authentication and Authorization**:
   - Verify user ownership before allowing document access
   - Implement rate limiting on API endpoints
   - Use HTTPS for all communications
   - Implement CSRF protection for state-changing operations

3. **Data Privacy**:
   - Encrypt sensitive data at rest using AES-256
   - Use TLS 1.3 for data in transit
   - Implement audit logging for all data access
   - Comply with healthcare data regulations (HIPAA-like requirements)

4. **Message Security**:
   - Encrypt message content before storage
   - Implement message expiration for sensitive communications
   - Prevent message forwarding to unauthorized users
   - Log all message access for audit purposes

### Performance Optimization

1. **Database Optimization**:
   - Add indexes on frequently queried columns (user_id, created_at, category)
   - Use database connection pooling
   - Implement query result caching for static data
   - Use pagination for large result sets

2. **File Serving Optimization**:
   - Implement streaming for large file downloads
   - Use CDN for static assets
   - Compress files before transmission
   - Implement browser caching headers

3. **Frontend Optimization**:
   - Lazy load components not immediately visible
   - Implement virtual scrolling for long lists
   - Debounce search inputs to reduce API calls
   - Use React.memo for expensive components

### Accessibility Requirements

1. **Keyboard Navigation**:
   - All interactive elements accessible via Tab key
   - Implement focus indicators for all focusable elements
   - Support keyboard shortcuts for common actions

2. **Screen Reader Support**:
   - Add ARIA labels to all interactive elements
   - Provide alt text for all images and icons
   - Use semantic HTML elements
   - Announce dynamic content changes

3. **Visual Accessibility**:
   - Maintain WCAG AA contrast ratios
   - Support browser zoom up to 200%
   - Provide text alternatives for visual information
   - Avoid relying solely on color to convey information
