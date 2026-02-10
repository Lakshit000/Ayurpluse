# Implementation Plan: Patient Portal Enhancements

## Overview

This implementation plan breaks down the Patient Portal Enhancements feature into discrete, incremental coding tasks. The approach follows a bottom-up strategy: database schema first, then backend APIs, then frontend components, with testing integrated throughout. Each task builds on previous work, ensuring no orphaned code and continuous validation of functionality.

The implementation is organized into 6 major phases: database setup, prescription management, notification system, medical reports and messaging, document vault, and final integration. Testing tasks are marked as optional with "*" to allow for faster MVP delivery while maintaining quality standards.

## Tasks

- [~] 1. Database Schema and File Storage Setup
  - [-] 1.1 Create new database tables for patient portal enhancements
    - Add `prescriptions` table with patient_id, doctor_id, clinical_record_id, prescription_date
    - Add `prescription_medications` table with prescription_id, medicine details, dosage
    - Add `notification_preferences` table with user_id and channel preferences
    - Add `medical_reports` table with patient_id, file metadata, category, tags
    - Add `messages` table with sender_id, recipient_id, content, attachments
    - Add `document_vault` table with patient_id, document metadata, expiry tracking
    - Add `document_shares` table with document_id, patient_id, doctor_id, timestamps
    - Enhance existing `notifications` table with notification_type, scheduled_for, delivery_status, metadata columns
    - Create indexes on frequently queried columns (user_id, created_at, category, recipient_id)
    - _Requirements: 1.1-1.6, 2.1-2.7, 3.1-3.6, 4.1-4.6, 5.1-5.7, 6.1-6.6_

  - [~] 1.2 Set up file storage directory structure
    - Create `server/uploads/prescriptions/` directory
    - Create `server/uploads/reports/` directory
    - Create `server/uploads/documents/` directory
    - Create `server/uploads/message_attachments/` directory
    - Implement file path sanitization utility function
    - Implement file validation utility (MIME type checking, size limits)
    - _Requirements: 3.1, 3.6, 5.1, 6.1_


- [~] 2. Prescription Management Implementation
  - [~] 2.1 Implement prescription data seeding and retrieval
    - Create function to seed prescriptions from existing clinical_records
    - Implement GET `/api/patient/prescriptions/:userId` endpoint with filtering (date, doctor, medicine)
    - Implement GET `/api/patient/prescriptions/:userId/:prescriptionId` endpoint for single prescription
    - Add query parameter parsing for filters
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

  - [ ]* 2.2 Write property test for prescription filtering
    - **Property 4: Prescription Filtering Correctness**
    - **Validates: Requirements 1.4, 1.5, 1.6**

  - [~] 2.3 Implement prescription PDF generation
    - Create PDF generation function using PDFKit
    - Include prescription header (patient name, doctor name, date)
    - Include medication list with dosage, frequency, duration
    - Include doctor signature and clinic information
    - Implement GET `/api/patient/prescriptions/:userId/:prescriptionId/download?format=pdf` endpoint
    - _Requirements: 1.1, 1.3_

  - [~] 2.4 Implement prescription image generation
    - Create image generation function using Jimp or Canvas
    - Render prescription as PNG image with proper formatting
    - Implement GET `/api/patient/prescriptions/:userId/:prescriptionId/download?format=image` endpoint
    - _Requirements: 1.1_

  - [ ]* 2.5 Write property test for prescription download formats
    - **Property 1: Prescription Download Format Availability**
    - **Validates: Requirements 1.1**

  - [~] 2.6 Implement prescription email functionality
    - Create email template for prescription delivery
    - Implement POST `/api/patient/prescriptions/:userId/:prescriptionId/email` endpoint
    - Accept recipientEmail and format in request body
    - Generate prescription in requested format and attach to email
    - Use existing Nodemailer configuration
    - _Requirements: 1.2_

  - [ ]* 2.7 Write property test for prescription email delivery
    - **Property 2: Prescription Email Delivery**
    - **Validates: Requirements 1.2**

  - [ ]* 2.8 Write unit tests for prescription management
    - Test prescription retrieval with various filters
    - Test PDF generation with sample prescription data
    - Test email sending with mock SMTP
    - Test error handling for invalid prescription IDs
    - _Requirements: 1.1-1.6_

- [~] 3. Enhanced Notification System Implementation
  - [~] 3.1 Implement notification preferences management
    - Create default notification preferences on user registration
    - Implement GET `/api/patient/notifications/:userId/preferences` endpoint
    - Implement PUT `/api/patient/notifications/:userId/preferences` endpoint
    - Store preferences in `notification_preferences` table
    - _Requirements: 2.1, 2.7_

  - [~] 3.2 Implement notification scheduling system
    - Create function to schedule medication reminders based on prescription dosage times
    - Create function to schedule appointment reminders (24hr and 1hr before)
    - Create function to schedule follow-up care reminders
    - Store scheduled notifications in `notifications` table with `scheduled_for` timestamp
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 3.3 Write property tests for notification scheduling
    - **Property 5: Medication Reminder Scheduling**
    - **Property 6: Appointment Reminder Creation**
    - **Property 7: Follow-up Reminder Delivery**
    - **Validates: Requirements 2.2, 2.3, 2.4**

  - [~] 3.4 Implement notification delivery system
    - Create background job or cron task to check for due notifications
    - Implement notification delivery based on user preferences (email, in-app)
    - Update notification delivery_status after sending
    - Implement retry logic for failed deliveries
    - _Requirements: 2.2, 2.3, 2.4, 7.6_

  - [~] 3.5 Implement notification history and status management
    - Implement GET `/api/patient/notifications/:userId?filter=all|read|unread` endpoint
    - Implement PUT `/api/patient/notifications/:userId/:notificationId/read` endpoint
    - Implement PUT `/api/patient/notifications/:userId/read-all` endpoint
    - Return unread count with notification list
    - _Requirements: 2.5, 2.6_

  - [ ]* 3.6 Write property tests for notification system
    - **Property 8: Notification Status Display**
    - **Property 9: Notification Read Status Update**
    - **Property 10: Notification Channel Filtering**
    - **Validates: Requirements 2.5, 2.6, 2.7**

  - [ ]* 3.7 Write unit tests for notification system
    - Test preference updates
    - Test notification scheduling logic
    - Test delivery status updates
    - Test filtering by read/unread status
    - _Requirements: 2.1-2.7_

- [~] 4. Checkpoint - Ensure prescription and notification features work
  - Ensure all tests pass, ask the user if questions arise.

- [~] 5. Medical Report Management Implementation
  - [~] 5.1 Implement medical report upload
    - Create multer middleware for file uploads with size limits (10MB)
    - Implement file type validation (PDF, JPEG, PNG, DICOM)
    - Implement POST `/api/patient/reports/:userId/upload` endpoint
    - Accept file, category, and tags in FormData
    - Store file in `server/uploads/reports/{patient_id}/` directory
    - Create database record in `medical_reports` table
    - _Requirements: 3.1, 3.3, 3.6, 6.1_

  - [ ]* 5.2 Write property tests for report upload
    - **Property 11: Report Upload and Association**
    - **Property 13: Report Categorization**
    - **Property 27: File Type Validation**
    - **Validates: Requirements 3.1, 3.3, 6.1**

  - [~] 5.3 Implement medical report retrieval and download
    - Implement GET `/api/patient/reports/:userId?category=&search=` endpoint
    - Implement filtering by category and search query
    - Implement GET `/api/patient/reports/:userId/:reportId/download` endpoint
    - Stream file from storage with original MIME type
    - Verify user ownership before allowing download
    - _Requirements: 3.2, 3.5, 6.3_

  - [ ]* 5.4 Write property test for report download round-trip
    - **Property 12: Report Download Round-Trip**
    - **Validates: Requirements 3.2**

  - [~] 5.5 Implement report sharing with doctors
    - Implement POST `/api/patient/reports/:userId/:reportId/share` endpoint
    - Accept doctorId in request body
    - Create record in `document_shares` table
    - Create audit log entry
    - Send notification to doctor about shared report
    - _Requirements: 3.4, 6.2_

  - [ ]* 5.6 Write property tests for report sharing
    - **Property 14: Report Sharing Access Grant**
    - **Property 28: Document Share Audit Logging**
    - **Validates: Requirements 3.4, 6.2**

  - [~] 5.7 Implement report metadata updates and deletion
    - Implement PUT `/api/patient/reports/:userId/:reportId` endpoint for updating category and tags
    - Implement DELETE `/api/patient/reports/:userId/:reportId` endpoint
    - Delete file from filesystem and database record
    - _Requirements: 3.3_

  - [ ]* 5.8 Write unit tests for medical report management
    - Test file upload with various file types
    - Test file size limit enforcement
    - Test search and filtering
    - Test sharing permissions
    - Test deletion cleanup
    - _Requirements: 3.1-3.6_

- [~] 6. Patient Communication Portal Implementation
  - [~] 6.1 Implement message encryption utilities
    - Create encryption function using crypto module (AES-256)
    - Create decryption function
    - Store encryption key securely in environment variables
    - _Requirements: 4.1, 6.5_

  - [~] 6.2 Implement message sending
    - Implement POST `/api/patient/messages/:userId/send` endpoint
    - Accept doctorId, content, attachments, isRefillRequest in request body
    - Encrypt message content before storage
    - Store message in `messages` table
    - Create notification for recipient doctor
    - _Requirements: 4.1, 4.4_

  - [ ]* 6.3 Write property tests for messaging
    - **Property 16: Message Encryption and Delivery**
    - **Property 19: Refill Request Flagging**
    - **Validates: Requirements 4.1, 4.4**

  - [~] 6.4 Implement message retrieval and threading
    - Implement GET `/api/patient/messages/:userId/conversations` endpoint
    - Return list of doctors with last message and unread count
    - Implement GET `/api/patient/messages/:userId/doctor/:doctorId` endpoint
    - Return messages in chronological order with decrypted content
    - Group messages by conversation
    - _Requirements: 4.3, 4.6_

  - [ ]* 6.5 Write property tests for message threading
    - **Property 18: Message Threading**
    - **Property 21: Message History Retention**
    - **Validates: Requirements 4.3, 4.6**

  - [~] 6.6 Implement message attachments
    - Allow attaching prescription references to messages
    - Store attachment metadata in messages.attachments JSON field
    - Implement attachment retrieval in message display
    - _Requirements: 4.5_

  - [~] 6.7 Implement message read status
    - Implement PUT `/api/patient/messages/:userId/doctor/:doctorId/read` endpoint
    - Mark all messages in conversation as read
    - Update read_at timestamp
    - _Requirements: 4.3_

  - [ ]* 6.8 Write property test for message notifications
    - **Property 17: Message Reply Notification**
    - **Property 20: Prescription Attachment Support**
    - **Validates: Requirements 4.2, 4.5**

  - [ ]* 6.9 Write unit tests for messaging system
    - Test message encryption/decryption
    - Test conversation grouping
    - Test attachment handling
    - Test read status updates
    - _Requirements: 4.1-4.6_

- [~] 7. Checkpoint - Ensure reports and messaging features work
  - Ensure all tests pass, ask the user if questions arise.

- [~] 8. Health Document Vault Implementation
  - [~] 8.1 Implement document vault upload
    - Implement POST `/api/patient/vault/:userId/upload` endpoint
    - Accept file, category, tags, expiryDate in FormData
    - Store file in `server/uploads/documents/{patient_id}/` directory
    - Create database record in `document_vault` table with metadata
    - _Requirements: 5.1, 5.2_

  - [ ]* 8.2 Write property tests for vault upload
    - **Property 22: Document Vault Metadata Storage**
    - **Property 23: Document Tag Round-Trip**
    - **Validates: Requirements 5.1, 5.2**

  - [~] 8.3 Implement document vault retrieval and search
    - Implement GET `/api/patient/vault/:userId?category=&search=&tags=` endpoint
    - Filter by category, search across filename/tags, filter by tags
    - Return documents with metadata
    - Implement GET `/api/patient/vault/:userId/tags` endpoint for tag list
    - _Requirements: 5.3, 5.5_

  - [ ]* 8.4 Write property test for vault search
    - **Property 15: Document Search Accuracy**
    - **Property 25: Document Category Organization**
    - **Validates: Requirements 5.3, 5.5**

  - [~] 8.5 Implement document expiry tracking
    - Create background job to check for expired documents daily
    - Update is_expired flag when expiry_date is reached
    - Create notification for patient when document expires
    - _Requirements: 5.4_

  - [ ]* 8.6 Write property test for document expiry
    - **Property 24: Document Expiry Notification**
    - **Validates: Requirements 5.4**

  - [~] 8.7 Implement document metadata updates and deletion
    - Implement PUT `/api/patient/vault/:userId/:documentId` endpoint
    - Update tags, category, expiryDate
    - Implement DELETE `/api/patient/vault/:userId/:documentId` endpoint
    - Delete file and all associated records (metadata, shares)
    - _Requirements: 5.2, 5.6_

  - [ ]* 8.8 Write property test for document deletion
    - **Property 26: Document Deletion Completeness**
    - **Validates: Requirements 5.6**

  - [ ]* 8.9 Write unit tests for document vault
    - Test document upload with metadata
    - Test search and filtering
    - Test expiry tracking
    - Test tag management
    - Test deletion cleanup
    - _Requirements: 5.1-5.7_

- [~] 9. Security and Error Handling Implementation
  - [~] 9.1 Implement authentication middleware for all new endpoints
    - Verify JWT token on all patient portal enhancement endpoints
    - Verify user ownership of resources (prescriptions, reports, documents, messages)
    - Return 401 for invalid/expired tokens, 403 for unauthorized access
    - _Requirements: 6.3, 6.6_

  - [ ]* 9.2 Write property tests for authentication
    - **Property 29: Document Access Authentication**
    - **Property 31: Session Expiry Cleanup**
    - **Validates: Requirements 6.3, 6.6**

  - [~] 9.3 Implement data encryption at rest
    - Encrypt sensitive document content before storage
    - Encrypt message content (already implemented in 6.1)
    - Use AES-256 encryption with secure key management
    - _Requirements: 6.4, 6.5_

  - [ ]* 9.4 Write property test for encryption
    - **Property 30: Data Encryption at Rest**
    - **Validates: Requirements 6.4, 6.5**

  - [~] 9.5 Implement comprehensive error handling
    - Add try-catch blocks to all API endpoints
    - Map technical errors to user-friendly messages
    - Implement upload failure retry mechanism
    - Implement email queue for failed deliveries
    - Log all errors with context for debugging
    - _Requirements: 7.5, 7.6, 8.2_

  - [ ]* 9.6 Write property tests for error handling
    - **Property 32: Upload Failure Error Handling**
    - **Property 33: Email Service Resilience**
    - **Property 34: Error Message Clarity**
    - **Validates: Requirements 7.5, 7.6, 8.2**

  - [ ]* 9.7 Write unit tests for security features
    - Test authentication middleware
    - Test authorization checks
    - Test encryption/decryption
    - Test error message formatting
    - _Requirements: 6.1-6.6, 7.5, 7.6, 8.2_

- [~] 10. Frontend Component Development - PatientRecords Enhancement
  - [~] 10.1 Create enhanced PatientRecords component
    - Replace placeholder with full prescription management UI
    - Create PrescriptionList component with search and filter controls
    - Create PrescriptionCard component for individual prescription display
    - Implement date range picker for date filtering
    - Implement doctor and medicine filter dropdowns
    - Add loading states and error handling
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

  - [~] 10.2 Implement prescription download and email features
    - Add download buttons for PDF and image formats
    - Implement download functionality calling backend API
    - Create email dialog modal with recipient input
    - Implement email sending functionality
    - Add success/error toast notifications
    - _Requirements: 1.1, 1.2_

  - [~] 10.3 Implement print-optimized prescription view
    - Create PrescriptionPrintView component
    - Remove navigation elements in print CSS
    - Add print button that opens print dialog
    - Style for optimal printing (page breaks, margins)
    - _Requirements: 1.3_

  - [~] 10.4 Style PatientRecords with Tailwind CSS
    - Use Ayurvedic color palette (emerald greens, warm beige)
    - Add Framer Motion animations for card entrance
    - Implement responsive design for mobile
    - Add icons from Lucide React
    - _Requirements: 1.1-1.6_

- [~] 11. Frontend Component Development - PatientNotifications
  - [~] 11.1 Create PatientNotifications component
    - Create NotificationSettings panel with channel toggles
    - Create toggle switches for email, in-app, SMS channels
    - Create toggle switches for reminder types (medication, appointment, follow-up)
    - Implement save functionality calling backend API
    - _Requirements: 2.1, 2.7_

  - [~] 11.2 Create notification history view
    - Create NotificationList component
    - Create NotificationCard for individual notifications
    - Implement filter tabs (all, unread, read)
    - Display notification icon based on type
    - Display read/unread status indicator
    - Implement mark as read functionality
    - Implement mark all as read functionality
    - _Requirements: 2.5, 2.6_

  - [~] 11.3 Style PatientNotifications with Tailwind CSS
    - Use consistent styling with existing patient portal
    - Add animations for notification entrance
    - Implement responsive design
    - Add visual feedback for toggle switches
    - _Requirements: 2.1-2.7_

- [~] 12. Frontend Component Development - PatientReports
  - [~] 12.1 Create PatientReports component
    - Create file upload dropzone with drag-and-drop
    - Create category selector (lab, imaging, consultation)
    - Implement file upload functionality with progress indicator
    - Add file type and size validation on client side
    - _Requirements: 3.1, 3.3, 3.6_

  - [~] 12.2 Create report grid and display
    - Create ReportGrid component with category tabs
    - Create ReportCard for individual reports
    - Display report thumbnail or file type icon
    - Display report metadata (name, date, category, size)
    - Implement search bar with debounced input
    - _Requirements: 3.5_

  - [~] 12.3 Implement report actions
    - Add download button calling backend API
    - Create share dialog with doctor selection
    - Implement sharing functionality
    - Add delete button with confirmation dialog
    - Implement deletion functionality
    - _Requirements: 3.2, 3.4_

  - [~] 12.4 Style PatientReports with Tailwind CSS
    - Use grid layout for report cards
    - Add hover effects and transitions
    - Implement responsive design
    - Add loading skeletons for uploads
    - _Requirements: 3.1-3.6_

- [~] 13. Frontend Component Development - PatientMessages
  - [~] 13.1 Create PatientMessages component structure
    - Create two-column layout (conversation list + message thread)
    - Create ConversationList sidebar component
    - Create DoctorCard for each conversation
    - Display doctor avatar, name, last message preview
    - Display unread badge if unread messages exist
    - _Requirements: 4.3_

  - [~] 13.2 Create message thread view
    - Create MessageThread component
    - Create MessageBubble for individual messages
    - Display messages in chronological order
    - Add date separators between days
    - Implement auto-scroll to latest message
    - Display message timestamps
    - _Requirements: 4.3, 4.6_

  - [~] 13.3 Implement message input and sending
    - Create MessageInput component with textarea
    - Add attachment button for prescriptions
    - Add refill request button
    - Implement send functionality calling backend API
    - Clear input after sending
    - Add optimistic UI update
    - _Requirements: 4.1, 4.4, 4.5_

  - [~] 13.4 Implement message notifications and read status
    - Poll for new messages or implement WebSocket connection
    - Show notification when new message arrives
    - Mark conversation as read when viewing
    - Update unread count in real-time
    - _Requirements: 4.2_

  - [~] 13.5 Style PatientMessages with Tailwind CSS
    - Use chat-style message bubbles
    - Differentiate sent vs received messages
    - Add smooth animations for new messages
    - Implement responsive design (stack on mobile)
    - _Requirements: 4.1-4.6_

- [~] 14. Frontend Component Development - PatientVault
  - [~] 14.1 Create PatientVault component structure
    - Create VaultHeader with search bar and upload button
    - Create view toggle (grid/list view)
    - Create CategoryFilter sidebar
    - List all categories and custom tags
    - _Requirements: 5.3, 5.5_

  - [~] 14.2 Create document grid and display
    - Create DocumentGrid component
    - Create DocumentCard for individual documents
    - Display document preview or icon
    - Display document metadata (name, date, size, tags)
    - Display expiry indicator if document has expiry date
    - Highlight expired documents
    - _Requirements: 5.1, 5.4, 5.5_

  - [~] 14.3 Implement document upload
    - Create upload dialog with file picker
    - Add category selector and tag input
    - Add expiry date picker (optional)
    - Implement upload functionality with progress
    - _Requirements: 5.1, 5.2_

  - [~] 14.4 Implement document actions and management
    - Add view/download button
    - Create tag management dialog for editing tags
    - Implement tag update functionality
    - Add delete button with confirmation
    - Implement search functionality across filename, tags, categories
    - _Requirements: 5.2, 5.3, 5.6_

  - [~] 14.5 Style PatientVault with Tailwind CSS
    - Use grid layout for documents
    - Add visual indicators for document types
    - Add expiry warning colors (yellow for soon, red for expired)
    - Implement responsive design
    - Add smooth transitions
    - _Requirements: 5.1-5.7_

- [~] 15. Checkpoint - Ensure all frontend components work
  - Ensure all tests pass, ask the user if questions arise.

- [~] 16. Integration and Navigation Updates
  - [~] 16.1 Update PatientDashboard navigation
    - Add navigation items for new features (Records, Notifications, Reports, Messages, Vault)
    - Update routing in PatientDashboard component
    - Add icons for each new section
    - Update active state highlighting
    - _Requirements: All_

  - [~] 16.2 Update NotificationBell component
    - Integrate with new notification system
    - Display unread count from new notifications API
    - Link to PatientNotifications component
    - _Requirements: 2.5, 2.6_

  - [~] 16.3 Create navigation between related features
    - Add "View in Vault" link from PatientRecords prescriptions
    - Add "Attach to Message" link from prescriptions and reports
    - Add "Share with Doctor" link from vault documents
    - _Requirements: 4.5, 5.7_

  - [ ]* 16.4 Write integration tests
    - Test complete prescription download workflow
    - Test complete report upload and sharing workflow
    - Test complete messaging workflow
    - Test notification delivery workflow
    - _Requirements: All_

- [~] 17. Final Polish and Optimization
  - [~] 17.1 Add loading states and error boundaries
    - Add loading spinners for all async operations
    - Add error boundaries to catch component errors
    - Implement retry buttons for failed operations
    - Add empty states for all list views
    - _Requirements: 7.5, 8.1_

  - [~] 17.2 Implement responsive design refinements
    - Test all components on mobile devices
    - Adjust layouts for tablet and mobile screens
    - Ensure touch targets are appropriately sized
    - Test file uploads on mobile
    - _Requirements: 8.5_

  - [~] 17.3 Add accessibility features
    - Add ARIA labels to all interactive elements
    - Ensure keyboard navigation works throughout
    - Add focus indicators
    - Test with screen reader
    - Ensure color contrast meets WCAG AA standards
    - _Requirements: 8.3, 8.6_

  - [~] 17.4 Performance optimization
    - Implement lazy loading for components
    - Add pagination for large lists (prescriptions, notifications, documents)
    - Optimize image loading with lazy loading
    - Implement debouncing for search inputs
    - Add caching for frequently accessed data
    - _Requirements: 7.1, 7.2, 7.3_

  - [~] 17.5 Security audit and testing
    - Test file upload validation thoroughly
    - Test authentication on all endpoints
    - Test authorization (users can only access their own data)
    - Verify encryption is working correctly
    - Test for common vulnerabilities (XSS, CSRF, SQL injection)
    - _Requirements: 6.1-6.6_

- [~] 18. Final Checkpoint - Complete system validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties across random inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests validate complete workflows across multiple components
- The implementation follows a bottom-up approach: database → backend → frontend
- All new features integrate with existing AyurPulse architecture and styling
- Security and authentication are implemented throughout, not as an afterthought
