# Implementation Plan: Doctor Workflow Enhancements

## Overview

This implementation plan breaks down the Doctor Workflow Enhancements feature into discrete, incremental coding tasks. The plan follows a bottom-up approach: database schema → API endpoints → React components → integration → testing. Each task builds on previous work, ensuring no orphaned code and continuous validation through testing.

## Tasks

- [ ] 1. Database Schema Setup
  - Create new database tables for prescription templates, follow-ups, favorites, search presets, drug interactions, and treatment outcomes
  - Add new columns to existing appointments and clinical_records tables
  - Create database indexes for performance optimization
  - Write database migration script with rollback capability
  - _Requirements: 1.1-1.8, 2.1-2.10, 3.1-3.7, 4.1-4.6, 5.1-5.6, 6.1-6.7_

- [ ] 2. Medicine and Prescription API Endpoints
  - [ ] 2.1 Implement prescription template endpoints (GET, POST, DELETE)
    - Create `/api/doctor/prescription-templates` endpoint to list templates
    - Create `/api/doctor/prescription-templates` POST endpoint to save templates
    - Create `/api/doctor/prescription-templates/:id` DELETE endpoint
    - _Requirements: 2.4, 2.5_
  
  - [ ]* 2.2 Write property test for prescription template round-trip
    - **Property 8: Prescription Template Round-Trip**
    - **Validates: Requirements 2.4, 2.5**
  
  - [ ] 2.3 Implement favorite medicines endpoints (GET, POST, DELETE)
    - Create `/api/doctor/favorite-medicines` endpoint to list favorites
    - Create `/api/doctor/favorite-medicines` POST endpoint to add favorite
    - Create `/api/doctor/favorite-medicines/:id` DELETE endpoint to remove favorite
    - _Requirements: 2.6_
  
  - [ ]* 2.4 Write property test for favorite medicines persistence
    - **Property 9: Favorite Medicines Persistence**
    - **Validates: Requirements 2.6**
  
  - [ ] 2.5 Implement prescription copy endpoint
    - Create `/api/doctor/prescriptions/:id/copy` endpoint
    - Return copied prescription with all medicines and dietary recommendations
    - _Requirements: 2.7_
  
  - [ ] 2.6 Implement dietary recommendations autocomplete endpoint
    - Create `/api/doctor/dietary-recommendations/search` endpoint
    - Query pathyam.csv and apathyam.csv data
    - _Requirements: 2.8_
  
  - [ ] 2.7 Implement PDF prescription generation endpoint
    - Create `/api/doctor/prescriptions/pdf` POST endpoint
    - Use PDFKit to generate PDF with all required sections
    - Include clinic branding, doctor details, patient details, medicines, dietary recommendations
    - _Requirements: 2.9_
  
  - [ ]* 2.8 Write property test for PDF prescription completeness
    - **Property 12: PDF Prescription Completeness**
    - **Validates: Requirements 2.9**

- [ ] 3. Patient Timeline API Endpoints
  - [ ] 3.1 Implement patient timeline endpoint
    - Create `/api/doctor/patient-timeline/:patientId` endpoint
    - Query clinical_records, dosha_history, panchakarma_cycles, and documents
    - Combine and sort all records chronologically
    - _Requirements: 1.1, 1.7, 1.8_
  
  - [ ]* 3.2 Write property test for timeline completeness
    - **Property 1: Timeline Completeness**
    - **Validates: Requirements 1.1**
  
  - [ ]* 3.3 Write property test for timeline filtering
    - **Property 4: Timeline Filtering**
    - **Validates: Requirements 1.4, 1.5**
  
  - [ ] 3.4 Implement dosha history chart data endpoint
    - Create `/api/doctor/patient-dosha-history/:patientId` endpoint
    - Return Prakruti baseline and all Vikruti measurements over time
    - Format data for Recharts line chart
    - _Requirements: 1.6_

- [ ] 4. Follow-up Management API Endpoints
  - [ ] 4.1 Implement follow-up endpoints (GET, POST, PUT)
    - Create `/api/doctor/follow-ups` GET endpoint to list pending follow-ups
    - Create `/api/doctor/follow-ups` POST endpoint to create follow-up
    - Create `/api/doctor/follow-ups/:id` PUT endpoint to update status
    - Implement sorting by priority and due date
    - _Requirements: 3.2, 3.3, 3.4_
  
  - [ ]* 4.2 Write property test for follow-up list sorting
    - **Property 16: Follow-up List Sorting**
    - **Validates: Requirements 3.3**
  
  - [ ] 4.3 Implement follow-up date suggestion logic
    - Create `/api/doctor/follow-ups/suggest-date` POST endpoint
    - Implement suggestion algorithm based on diagnosis type
    - Return recommended date with reason
    - _Requirements: 3.1_
  
  - [ ]* 4.4 Write property test for follow-up date suggestion
    - **Property 14: Follow-up Date Suggestion**
    - **Validates: Requirements 3.1**
  
  - [ ] 4.5 Implement follow-up compliance calculation endpoint
    - Create `/api/doctor/patients/:id/follow-up-compliance` endpoint
    - Calculate (completed / total) × 100
    - _Requirements: 3.5_
  
  - [ ] 4.6 Implement bulk follow-up scheduling endpoint
    - Create `/api/doctor/follow-ups/bulk` POST endpoint
    - Accept array of patient IDs and create follow-ups for each
    - _Requirements: 3.6_
  
  - [ ] 4.7 Implement follow-up notification creation
    - Modify follow-up creation to generate notifications for doctor and patient
    - Insert into notifications table
    - _Requirements: 3.2_

- [ ] 5. Checkpoint - Verify API Endpoints
  - Test all API endpoints with Postman or similar tool
  - Verify database operations are working correctly
  - Ensure all tests pass, ask the user if questions arise

- [ ] 6. Clinical Decision Support API Endpoints
  - [ ] 6.1 Implement medicine suggestion endpoint
    - Create `/api/doctor/clinical-suggestions/medicines` POST endpoint
    - Query disease_medicine_master table based on diagnosis
    - Filter by patient Vikruti for dosha-appropriate medicines
    - _Requirements: 4.1_
  
  - [ ]* 6.2 Write property test for medicine suggestion relevance
    - **Property 21: Medicine Suggestion Relevance**
    - **Validates: Requirements 4.1**
  
  - [ ] 6.3 Implement drug interaction checking endpoint
    - Create `/api/doctor/clinical-suggestions/interactions` POST endpoint
    - Accept array of medicine IDs
    - Check drug_interactions table for all pairs
    - Return warnings with severity and description
    - _Requirements: 4.2_
  
  - [ ]* 6.4 Write property test for drug interaction detection
    - **Property 22: Drug Interaction Detection**
    - **Validates: Requirements 4.2**
  
  - [ ] 6.5 Implement Panchakarma protocol recommendation endpoint
    - Create `/api/doctor/clinical-suggestions/panchakarma` POST endpoint
    - Analyze patient Vikruti scores
    - Recommend protocols for doshas exceeding 60% threshold
    - _Requirements: 4.4_
  
  - [ ] 6.6 Implement treatment outcome statistics endpoint
    - Create `/api/doctor/clinical-suggestions/outcomes/:diagnosis` endpoint
    - Query treatment_outcomes table for similar diagnoses
    - Calculate improvement rate, average duration, common medicines
    - _Requirements: 4.5_

- [ ] 7. Patient Search and Filter API Endpoints
  - [ ] 7.1 Implement advanced patient search endpoint
    - Create `/api/doctor/patients/search` GET endpoint
    - Search across name, phone, ID, diagnosis fields (case-insensitive)
    - Apply filters for dosha type, treatment status, last visit date range
    - Include Vikruti status, last visit, pending follow-ups in results
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [ ]* 7.2 Write property test for multi-field search coverage
    - **Property 26: Multi-field Search Coverage**
    - **Validates: Requirements 5.1**
  
  - [ ]* 7.3 Write property test for filter criteria application
    - **Property 27: Filter Criteria Application**
    - **Validates: Requirements 5.2**
  
  - [ ] 7.4 Implement search preset endpoints (GET, POST, DELETE)
    - Create `/api/doctor/search-presets` GET endpoint to list presets
    - Create `/api/doctor/search-presets` POST endpoint to save preset
    - Create `/api/doctor/search-presets/:id` DELETE endpoint
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 7.5 Write property test for search preset round-trip
    - **Property 28: Search Preset Round-Trip**
    - **Validates: Requirements 5.3, 5.4**

- [ ] 8. Appointment Management API Endpoints
  - [ ] 8.1 Implement appointment calendar endpoint
    - Create `/api/doctor/appointments/calendar` GET endpoint
    - Accept date range and view type (day/week) parameters
    - Return appointments with patient details
    - _Requirements: 6.1_
  
  - [ ] 8.2 Implement appointment status update endpoint
    - Create `/api/doctor/appointments/:id/status` PUT endpoint
    - Update status to completed, cancelled, or no-show
    - Update last modified timestamp
    - _Requirements: 6.2_
  
  - [ ]* 8.3 Write property test for appointment status update
    - **Property 31: Appointment Status Update**
    - **Validates: Requirements 6.2**
  
  - [ ] 8.4 Implement appointment notes endpoint
    - Create `/api/doctor/appointments/:id/notes` PUT endpoint
    - Save notes to appointments table
    - _Requirements: 6.4_
  
  - [ ] 8.5 Implement appointment rescheduling endpoint
    - Create `/api/doctor/appointments/:id/reschedule` PUT endpoint
    - Update date and time
    - Create notification for patient
    - _Requirements: 6.5_
  
  - [ ]* 8.6 Write property test for appointment rescheduling
    - **Property 33: Appointment Rescheduling**
    - **Validates: Requirements 6.5**
  
  - [ ] 8.7 Implement time slot blocking endpoint
    - Create `/api/doctor/appointments/block-slot` POST endpoint
    - Create appointment record with blocked_slot flag
    - _Requirements: 6.6_
  
  - [ ] 8.8 Implement appointment statistics endpoint
    - Create `/api/doctor/appointments/statistics` GET endpoint
    - Accept date range parameter
    - Calculate completion, cancellation, and no-show rates
    - _Requirements: 6.7_
  
  - [ ]* 8.9 Write property test for appointment statistics calculation
    - **Property 35: Appointment Statistics Calculation**
    - **Validates: Requirements 6.7**

- [ ] 9. Checkpoint - Verify All API Endpoints
  - Run comprehensive API tests
  - Verify all database operations
  - Check error handling for invalid inputs
  - Ensure all tests pass, ask the user if questions arise

- [ ] 10. Patient Timeline View Component
  - [ ] 10.1 Create PatientTimelineView component
    - Build timeline UI with chronological record display
    - Implement expandable entries with Framer Motion animations
    - Add date range picker for filtering
    - Add record type checkboxes (Clinical, Dosha, Panchakarma, Documents)
    - Integrate with `/api/doctor/patient-timeline/:patientId` endpoint
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8_
  
  - [ ]* 10.2 Write unit tests for timeline component
    - Test rendering with various record types
    - Test expand/collapse functionality
    - Test filtering behavior
    - _Requirements: 1.1-1.5_
  
  - [ ] 10.3 Add dosha history chart to timeline
    - Integrate Recharts line chart component
    - Display Prakruti baseline and Vikruti changes over time
    - Use three lines for Vata, Pitta, Kapha
    - _Requirements: 1.6_
  
  - [ ] 10.4 Add document download functionality
    - Display document links in timeline
    - Implement download handler
    - _Requirements: 1.8_

- [ ] 11. Enhanced Prescription Builder Component
  - [ ] 11.1 Create PrescriptionBuilder component
    - Build prescription form with medicine entries
    - Extend existing medicine search with autocomplete
    - Add dosage, timing, duration, form fields
    - Integrate with `/api/medicines/search` endpoint
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 11.2 Add prescription template functionality
    - Add "Save as Template" button with name input
    - Add "Load Template" dropdown
    - Integrate with `/api/doctor/prescription-templates` endpoints
    - _Requirements: 2.4, 2.5_
  
  - [ ] 11.3 Add favorite medicines functionality
    - Add star icon next to each medicine for favoriting
    - Display favorites list with quick-add buttons
    - Integrate with `/api/doctor/favorite-medicines` endpoints
    - _Requirements: 2.6_
  
  - [ ] 11.4 Add copy previous prescription functionality
    - Add "Copy from Previous" button in prescription form
    - Show patient's prescription history in modal
    - Implement copy and populate logic
    - _Requirements: 2.7_
  
  - [ ] 11.5 Add dietary recommendations with autocomplete
    - Add Pathyam and Apathyam input fields
    - Implement autocomplete for both fields
    - Integrate with `/api/doctor/dietary-recommendations/search` endpoint
    - _Requirements: 2.8_
  
  - [ ] 11.6 Add PDF generation functionality
    - Add "Generate PDF" button
    - Integrate with `/api/doctor/prescriptions/pdf` endpoint
    - Handle PDF download in browser
    - _Requirements: 2.9_
  
  - [ ]* 11.7 Write unit tests for prescription builder
    - Test medicine selection and form population
    - Test template save and load
    - Test favorites add and remove
    - Test copy prescription
    - _Requirements: 2.1-2.9_

- [ ] 12. Follow-up Manager Component
  - [ ] 12.1 Create FollowUpManager component
    - Build follow-ups list UI with sorting
    - Display patient name, due date, status, priority
    - Add status indicators (pending, overdue, completed)
    - Integrate with `/api/doctor/follow-ups` endpoint
    - _Requirements: 3.3, 3.4_
  
  - [ ] 12.2 Add follow-up creation with date suggestion
    - Add "Create Follow-up" button
    - Integrate with `/api/doctor/follow-ups/suggest-date` for suggestions
    - Show suggested date with reason
    - Allow manual date override
    - _Requirements: 3.1, 3.2_
  
  - [ ] 12.3 Add follow-up compliance display
    - Show compliance rate in patient profile view
    - Integrate with `/api/doctor/patients/:id/follow-up-compliance` endpoint
    - Display as percentage with visual indicator
    - _Requirements: 3.5_
  
  - [ ] 12.4 Add bulk follow-up scheduling
    - Add checkbox selection to patient list
    - Add "Bulk Schedule Follow-up" button
    - Integrate with `/api/doctor/follow-ups/bulk` endpoint
    - _Requirements: 3.6_
  
  - [ ] 12.5 Add appointment integration
    - Link follow-ups to appointment creation
    - Show "Schedule Appointment" button for each follow-up
    - Pre-fill appointment form with follow-up details
    - _Requirements: 3.7_
  
  - [ ]* 12.6 Write unit tests for follow-up manager
    - Test follow-up list rendering and sorting
    - Test follow-up creation with suggestions
    - Test bulk scheduling
    - _Requirements: 3.1-3.7_

- [ ] 13. Checkpoint - Verify Core Components
  - Test all components in isolation
  - Verify API integration
  - Check responsive design
  - Ensure all tests pass, ask the user if questions arise

- [ ] 14. Clinical Decision Support Component
  - [ ] 14.1 Create ClinicalDecisionSupport component
    - Build suggestions panel for clinical entry screen
    - Display medicine suggestions based on diagnosis
    - Integrate with `/api/doctor/clinical-suggestions/medicines` endpoint
    - _Requirements: 4.1_
  
  - [ ] 14.2 Add drug interaction warnings
    - Monitor prescription medicines array
    - Check interactions when medicines change
    - Display warnings with severity badges
    - Integrate with `/api/doctor/clinical-suggestions/interactions` endpoint
    - _Requirements: 4.2_
  
  - [ ] 14.3 Add allergy alerts
    - Fetch patient allergies when prescription starts
    - Display prominent alert banner if allergies exist
    - Show alert before prescription finalization
    - _Requirements: 4.3_
  
  - [ ] 14.4 Add Panchakarma protocol recommendations
    - Display recommendations when viewing patient with high Vikruti
    - Integrate with `/api/doctor/clinical-suggestions/panchakarma` endpoint
    - Show protocol details and reasoning
    - _Requirements: 4.4_
  
  - [ ] 14.5 Add treatment outcome statistics
    - Display statistics panel when diagnosis is entered
    - Integrate with `/api/doctor/clinical-suggestions/outcomes/:diagnosis` endpoint
    - Show improvement rate, duration, common medicines
    - _Requirements: 4.5_
  
  - [ ] 14.6 Add treatment guidelines quick reference
    - Add "Guidelines" button in clinical entry
    - Display guidelines in modal using React Markdown
    - Load guidelines from markdown files
    - _Requirements: 4.6_
  
  - [ ]* 14.7 Write unit tests for clinical decision support
    - Test medicine suggestions display
    - Test drug interaction warnings
    - Test allergy alerts
    - Test Panchakarma recommendations
    - _Requirements: 4.1-4.6_

- [ ] 15. Advanced Patient Search Component
  - [ ] 15.1 Create AdvancedPatientSearch component
    - Extend existing DoctorPatients component
    - Add multi-field search input
    - Add filter controls (dosha type, treatment status, date range)
    - Integrate with `/api/doctor/patients/search` endpoint
    - _Requirements: 5.1, 5.2_
  
  - [ ] 15.2 Add search preset functionality
    - Add "Save Preset" button with name input
    - Add preset dropdown to load saved presets
    - Integrate with `/api/doctor/search-presets` endpoints
    - _Requirements: 5.3, 5.4_
  
  - [ ] 15.3 Add recently viewed patients
    - Track viewed patients in localStorage
    - Display recent 10 patients in quick-access section
    - Update list when patient is viewed
    - _Requirements: 5.5_
  
  - [ ] 15.4 Add health indicators to search results
    - Display Vikruti status badge for each patient
    - Show last visit date
    - Show pending follow-up indicator
    - _Requirements: 5.6_
  
  - [ ]* 15.5 Write unit tests for advanced search
    - Test multi-field search
    - Test filter application
    - Test preset save and load
    - Test recently viewed tracking
    - _Requirements: 5.1-5.6_

- [ ] 16. Appointment Calendar Component
  - [ ] 16.1 Create AppointmentCalendar component
    - Build calendar grid layout with CSS Grid
    - Implement day and week view toggle
    - Display appointments in time slots
    - Color-code by status
    - Integrate with `/api/doctor/appointments/calendar` endpoint
    - _Requirements: 6.1_
  
  - [ ] 16.2 Add appointment status management
    - Add status dropdown for each appointment
    - Integrate with `/api/doctor/appointments/:id/status` endpoint
    - Update UI optimistically
    - _Requirements: 6.2_
  
  - [ ] 16.3 Add quick link to clinical record creation
    - Show "Create Record" button for completed appointments
    - Pre-fill clinical entry form with appointment details
    - _Requirements: 6.3_
  
  - [ ] 16.4 Add appointment notes functionality
    - Add notes input field in appointment details
    - Integrate with `/api/doctor/appointments/:id/notes` endpoint
    - Auto-save notes on blur
    - _Requirements: 6.4_
  
  - [ ] 16.5 Add appointment rescheduling
    - Add "Reschedule" button in appointment details
    - Show date/time picker
    - Integrate with `/api/doctor/appointments/:id/reschedule` endpoint
    - Show notification confirmation
    - _Requirements: 6.5_
  
  - [ ] 16.6 Add time slot blocking
    - Add "Block Time" button in calendar
    - Show time range picker
    - Integrate with `/api/doctor/appointments/block-slot` endpoint
    - Mark blocked slots visually
    - _Requirements: 6.6_
  
  - [ ] 16.7 Add appointment statistics dashboard
    - Create statistics panel above calendar
    - Display completion, cancellation, no-show rates
    - Add date range selector
    - Integrate with `/api/doctor/appointments/statistics` endpoint
    - _Requirements: 6.7_
  
  - [ ]* 16.8 Write unit tests for appointment calendar
    - Test calendar rendering in day and week views
    - Test appointment status updates
    - Test rescheduling
    - Test time slot blocking
    - _Requirements: 6.1-6.7_

- [ ] 17. Integration with Existing Dashboard
  - [ ] 17.1 Add new menu items to DoctorDashboard
    - Add "Patient Timeline" option (opens modal)
    - Add "Follow-ups" menu item
    - Add "Appointments" menu item (replaces or enhances existing)
    - Update navigation state management
    - _Requirements: All_
  
  - [ ] 17.2 Integrate PatientTimelineView with DoctorPatients
    - Add "View Timeline" action in patient actions menu
    - Open PatientTimelineView modal when clicked
    - Pass patient ID to timeline component
    - _Requirements: 1.1-1.8_
  
  - [ ] 17.3 Integrate PrescriptionBuilder with DoctorClinicalEntry
    - Replace existing prescription section with PrescriptionBuilder
    - Maintain existing vitals and diagnosis sections
    - Ensure seamless data flow
    - _Requirements: 2.1-2.10_
  
  - [ ] 17.4 Add ClinicalDecisionSupport to DoctorClinicalEntry
    - Add decision support panel to right side of clinical entry
    - Show suggestions, warnings, and statistics
    - Update dynamically as doctor enters data
    - _Requirements: 4.1-4.6_
  
  - [ ] 17.5 Replace patient search in DoctorPatients
    - Replace existing search with AdvancedPatientSearch
    - Maintain existing patient list display
    - Add filter controls and presets
    - _Requirements: 5.1-5.6_
  
  - [ ] 17.6 Add AppointmentCalendar as new dashboard view
    - Create new "Appointments" tab in dashboard
    - Render AppointmentCalendar component
    - Add navigation from other components
    - _Requirements: 6.1-6.7_

- [ ] 18. Error Handling and Loading States
  - [ ] 18.1 Add error boundaries to all new components
    - Wrap components in React error boundaries
    - Display user-friendly error messages
    - Log errors to console for debugging
    - _Requirements: All_
  
  - [ ] 18.2 Add loading states to all async operations
    - Show spinners during API calls
    - Disable buttons during operations
    - Show skeleton loaders for data-heavy components
    - _Requirements: All_
  
  - [ ] 18.3 Add retry logic for failed API calls
    - Implement exponential backoff retry (3 attempts)
    - Show retry button for permanent failures
    - Display clear error messages
    - _Requirements: All_
  
  - [ ] 18.4 Add validation to all forms
    - Client-side validation before API calls
    - Display inline validation errors
    - Prevent submission of invalid data
    - _Requirements: All_

- [ ] 19. Final Checkpoint - End-to-End Testing
  - Test complete workflows (prescription creation, follow-up scheduling, appointment management)
  - Verify all components integrate correctly
  - Test error handling and edge cases
  - Verify responsive design on mobile devices
  - Ensure all tests pass, ask the user if questions arise

- [ ] 20. Performance Optimization
  - [ ] 20.1 Add database indexes
    - Create indexes on frequently queried fields
    - Index foreign keys for join performance
    - Index date fields for range queries
    - _Requirements: All_
  
  - [ ] 20.2 Implement pagination for large result sets
    - Add pagination to patient search results
    - Add pagination to prescription history
    - Add pagination to follow-ups list
    - _Requirements: 2.10, 3.3, 5.1_
  
  - [ ] 20.3 Add caching for frequently accessed data
    - Cache medicine database in memory
    - Cache treatment guidelines
    - Implement cache invalidation strategy
    - _Requirements: 2.1, 4.6_
  
  - [ ] 20.4 Optimize SQL queries
    - Use EXPLAIN to analyze query performance
    - Optimize joins and subqueries
    - Reduce N+1 query problems
    - _Requirements: All_

- [ ] 21. Documentation and Deployment Preparation
  - [ ] 21.1 Write API documentation
    - Document all new endpoints with examples
    - Include request/response formats
    - Document error codes and messages
    - _Requirements: All_
  
  - [ ] 21.2 Write component documentation
    - Document component props and usage
    - Add JSDoc comments to functions
    - Create usage examples
    - _Requirements: All_
  
  - [ ] 21.3 Create database migration script
    - Write SQL migration for new tables
    - Write SQL migration for new columns
    - Include rollback script
    - Test migration on clean database
    - _Requirements: All_
  
  - [ ] 21.4 Seed initial data
    - Import drug interactions data
    - Add sample prescription templates
    - Add treatment guidelines
    - _Requirements: 4.2, 4.6_

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and integration points
- The implementation follows a bottom-up approach: database → API → components → integration
- All components follow existing AyurPulse patterns (Tailwind styling, Framer Motion animations, modal-based details)
- Error handling and loading states are added after core functionality is complete
- Performance optimization is done after functional completion to avoid premature optimization
