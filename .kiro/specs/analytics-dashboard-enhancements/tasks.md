# Implementation Plan: Analytics Dashboard Enhancements

## Overview

This implementation plan breaks down the Analytics Dashboard Enhancements feature into incremental, testable steps. The approach follows a bottom-up strategy: first establishing the database foundation and backend analytics services, then building the API layer, and finally creating the enhanced frontend components. Each major component includes property-based tests to validate correctness properties from the design document.

## Tasks

- [ ] 1. Set up database schema and analytics infrastructure
  - Create `analytics_cache` table for performance optimization
  - Create `scheduled_reports` table for report scheduling
  - Add database indexes on frequently queried columns (appointments.date, clinical_records.diagnosis, users.role)
  - Write database migration script
  - _Requirements: 7.3, 7.4_

- [ ] 2. Implement core analytics service functions
  - [ ] 2.1 Create analytics service module structure
    - Create `server/services/analyticsService.js` file
    - Define service function exports
    - Set up error handling utilities
    - _Requirements: All analytics requirements_

  - [ ] 2.2 Implement visit analytics aggregation functions
    - Write `getVisitAnalytics(filters)` function
    - Implement time period aggregation logic (daily, weekly, monthly, yearly)
    - Calculate new vs returning patient ratios
    - Generate visit frequency distribution
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

  - [ ]* 2.3 Write property tests for visit analytics
    - **Property 1: Time Period Aggregation Correctness**
    - **Property 3: Visit Frequency Distribution Completeness**
    - **Property 4: Ratio Calculation Correctness**
    - **Property 9: Filter Inclusivity**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.6**

  - [ ] 2.4 Implement treatment analytics aggregation functions
    - Write `getTreatmentAnalytics(filters)` function
    - Aggregate diagnoses with frequency counts
    - Aggregate medicine usage from medications table
    - Calculate Panchakarma adoption rate
    - Calculate dosha distribution from users table
    - Implement trending conditions comparison logic
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.5 Write property tests for treatment analytics
    - **Property 2: Grouping Preserves Totals**
    - **Property 5: Percentage Calculation Correctness**
    - **Property 8: Ranking Order Correctness**
    - **Property 10: Trend Detection Consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [ ] 2.6 Implement revenue analytics aggregation functions
    - Write `getRevenueAnalytics(filters)` function
    - Aggregate revenue by time period
    - Group revenue by treatment type
    - Calculate average consultation fees
    - Calculate payment collection rates
    - Identify and rank high-value patients
    - Implement simple linear regression for revenue forecasting
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 2.7 Write property tests for revenue analytics
    - **Property 1: Time Period Aggregation Correctness**
    - **Property 2: Grouping Preserves Totals**
    - **Property 6: Average Calculation Correctness**
    - **Property 8: Ranking Order Correctness**
    - **Property 23: Revenue Forecast Trend Alignment**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 3.6**

  - [ ] 2.8 Implement doctor performance analytics functions
    - Write `getDoctorPerformanceAnalytics(filters)` function
    - Count consultations per doctor
    - Calculate appointment completion rates
    - Calculate follow-up compliance rates
    - Aggregate prescription patterns per doctor
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [ ]* 2.9 Write property tests for doctor performance analytics
    - **Property 2: Grouping Preserves Totals**
    - **Property 5: Percentage Calculation Correctness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ] 2.10 Implement operational efficiency analytics functions
    - Write `getOperationalAnalytics(filters)` function
    - Calculate average consultation duration from timestamps
    - Calculate average appointment wait times
    - Calculate no-show and cancellation rates
    - Aggregate medicine inventory usage
    - Implement bottleneck identification logic
    - Aggregate system usage patterns by hour from audit_logs
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 2.11 Write property tests for operational efficiency analytics
    - **Property 6: Average Calculation Correctness**
    - **Property 5: Percentage Calculation Correctness**
    - **Property 21: Bottleneck Identification Criteria**
    - **Property 22: Peak Usage Hour Identification**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.5, 5.6**

- [ ] 3. Implement caching layer
  - [ ] 3.1 Create cache service module
    - Create `server/services/cacheService.js` file
    - Implement `getCachedAnalytics(cacheKey, ttl)` function
    - Implement `setCachedAnalytics(cacheKey, data, ttl)` function
    - Implement cache key generation from filters
    - Add cache cleanup for expired entries
    - _Requirements: 7.4_

  - [ ]* 3.2 Write property tests for caching
    - **Property 16: Cache Freshness**
    - **Validates: Requirements 7.4**

- [ ] 4. Checkpoint - Ensure analytics service tests pass
  - Run all analytics service tests
  - Verify property tests pass with 100+ iterations
  - Ask the user if questions arise

- [ ] 5. Implement report generation services
  - [ ] 5.1 Create report generator module
    - Create `server/services/reportGenerator.js` file
    - Set up PDFKit for PDF generation
    - Set up CSV formatting utilities
    - _Requirements: 6.4, 6.5_

  - [ ] 5.2 Implement PDF report generation
    - Write `generatePDFReport(reportData, widgets)` function
    - Format analytics data into PDF sections
    - Add charts as embedded images or tables
    - Include headers, footers, and branding
    - _Requirements: 6.4_

  - [ ]* 5.3 Write property test for PDF export
    - **Property 12: PDF Export Completeness**
    - **Validates: Requirements 6.4**

  - [ ] 5.4 Implement CSV report generation
    - Write `generateCSVReport(reportData, widgets)` function
    - Convert analytics data to CSV format with headers
    - Handle nested data structures
    - _Requirements: 6.5, 1.5_

  - [ ]* 5.5 Write property test for CSV export
    - **Property 11: CSV Export Round-Trip Integrity**
    - **Validates: Requirements 6.5, 1.5**

- [ ] 6. Implement report scheduling service
  - [ ] 6.1 Create report scheduler module
    - Create `server/services/reportScheduler.js` file
    - Install and configure node-cron for scheduling
    - Implement `scheduleReport(config)` function
    - Implement `executeScheduledReport(scheduleId)` function
    - Set up Nodemailer for email delivery
    - _Requirements: 6.3_

  - [ ]* 6.2 Write property test for report scheduling
    - **Property 20: Report Schedule Execution**
    - **Validates: Requirements 6.3**

- [ ] 7. Implement backend API routes
  - [ ] 7.1 Create analytics API routes
    - Add `GET /api/analytics/visits` endpoint
    - Add `GET /api/analytics/treatments` endpoint
    - Add `GET /api/analytics/revenue` endpoint
    - Add `GET /api/analytics/doctors` endpoint
    - Add `GET /api/analytics/operations` endpoint
    - Integrate with analytics service functions
    - Add query parameter parsing for filters
    - _Requirements: 1.1-1.6, 2.1-2.6, 3.1-3.6, 4.1-4.6, 5.1-5.6_

  - [ ] 7.2 Implement access control middleware
    - Create authentication middleware to verify JWT tokens
    - Create authorization middleware to check user roles
    - Implement doctor data filtering (restrict to own patients)
    - Implement administrator full access
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 7.3 Write property tests for access control
    - **Property 17: Role-Based Access Control**
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ] 7.4 Create export and scheduling API routes
    - Add `POST /api/analytics/export` endpoint
    - Add `POST /api/analytics/schedule-report` endpoint
    - Add `GET /api/analytics/scheduled-reports` endpoint
    - Add `DELETE /api/analytics/scheduled-reports/:id` endpoint
    - Integrate with report generator and scheduler services
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ] 7.5 Implement audit logging for analytics access
    - Add audit log creation on each analytics endpoint access
    - Record user ID, timestamp, report type, and filters
    - _Requirements: 8.5_

  - [ ]* 7.6 Write property test for audit logging
    - **Property 19: Audit Logging Completeness**
    - **Validates: Requirements 8.5**

  - [ ] 7.7 Implement data anonymization for exports
    - Create anonymization utility function
    - Apply anonymization to patient identifiers in export data
    - Maintain consistent anonymization within single export
    - _Requirements: 8.4_

  - [ ]* 7.8 Write property test for data anonymization
    - **Property 18: Data Anonymization in Exports**
    - **Validates: Requirements 8.4**

- [ ] 8. Checkpoint - Ensure backend API tests pass
  - Run all backend API tests
  - Test endpoints with Postman or curl
  - Verify access control works correctly
  - Ask the user if questions arise

- [ ] 9. Create frontend analytics components
  - [ ] 9.1 Create reusable AnalyticsWidget component
    - Create `src/components/doctor/analytics/AnalyticsWidget.jsx`
    - Implement loading states
    - Implement error states with retry
    - Add export button integration
    - Add drill-down click handler support
    - Style with Tailwind CSS matching existing design
    - _Requirements: 6.1_

  - [ ] 9.2 Create AnalyticsFilters component
    - Create `src/components/doctor/analytics/AnalyticsFilters.jsx`
    - Implement date range picker (daily, weekly, monthly, yearly, custom)
    - Implement demographic filters (age, gender, prakruti)
    - Implement doctor selection dropdown
    - Add Apply and Reset buttons
    - _Requirements: 1.6_

  - [ ] 9.3 Create VisitAnalyticsWidget component
    - Create `src/components/doctor/analytics/VisitAnalyticsWidget.jsx`
    - Implement line chart for visit trends using Recharts
    - Implement pie chart for new vs returning ratio
    - Implement bar chart for visit frequency distribution
    - Add period comparison display
    - Integrate with `/api/analytics/visits` endpoint
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 9.4 Create TreatmentAnalyticsWidget component
    - Create `src/components/doctor/analytics/TreatmentAnalyticsWidget.jsx`
    - Implement horizontal bar chart for top diagnoses
    - Implement searchable table for medicine usage
    - Implement gauge chart for Panchakarma adoption rate
    - Enhance existing dosha distribution donut chart
    - Implement line chart for trending conditions
    - Integrate with `/api/analytics/treatments` endpoint
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 9.5 Create RevenueAnalyticsWidget component
    - Create `src/components/doctor/analytics/RevenueAnalyticsWidget.jsx`
    - Implement line chart for revenue trends
    - Implement stacked bar chart for revenue by type
    - Display average consultation fee as KPI card
    - Display payment collection rate as progress bar
    - Implement ranked list for high-value patients
    - Implement projected line for revenue forecast
    - Integrate with `/api/analytics/revenue` endpoint
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 9.6 Create DoctorPerformanceWidget component
    - Create `src/components/doctor/analytics/DoctorPerformanceWidget.jsx`
    - Implement bar chart for consultations per doctor
    - Implement table for appointment completion rates
    - Implement percentage bars for follow-up compliance
    - Implement radar chart for comparative performance (multi-doctor)
    - Display prescription patterns as frequency list
    - Integrate with `/api/analytics/doctors` endpoint
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

  - [ ] 9.7 Create OperationalEfficiencyWidget component
    - Create `src/components/doctor/analytics/OperationalEfficiencyWidget.jsx`
    - Display average consultation duration as KPI card
    - Implement histogram for appointment wait times
    - Implement pie chart for no-show/cancellation rates
    - Implement table for medicine inventory usage
    - Implement heatmap for patient flow bottlenecks
    - Implement line chart for system usage patterns by hour
    - Integrate with `/api/analytics/operations` endpoint
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 10. Implement report export and scheduling UI
  - [ ] 10.1 Create ReportExporter component
    - Create `src/components/doctor/analytics/ReportExporter.jsx`
    - Implement format selection modal (PDF, CSV)
    - Implement widget selection checkboxes
    - Add export button with loading state
    - Handle file download from API response
    - _Requirements: 6.4, 6.5_

  - [ ] 10.2 Create ReportScheduler component
    - Create `src/components/doctor/analytics/ReportScheduler.jsx`
    - Implement schedule configuration form (frequency, day, time)
    - Implement email recipient management (add/remove)
    - Display list of existing scheduled reports
    - Add delete scheduled report functionality
    - Integrate with `/api/analytics/schedule-report` endpoints
    - _Requirements: 6.3_

- [ ] 11. Enhance DoctorAnalytics main component
  - [ ] 11.1 Integrate new analytics widgets
    - Import all new widget components
    - Add widget configuration state management
    - Implement widget enable/disable toggles
    - Implement widget reordering (drag-and-drop or up/down buttons)
    - _Requirements: 6.2_

  - [ ]* 11.2 Write property test for widget configuration
    - **Property 14: Widget Configuration Consistency**
    - **Validates: Requirements 6.2**

  - [ ] 11.3 Implement drill-down functionality
    - Add drill-down state management
    - Create drill-down modal or side panel
    - Pass drill-down handlers to all widgets
    - Fetch detailed data on drill-down click
    - _Requirements: 6.1_

  - [ ]* 11.4 Write property test for drill-down
    - **Property 15: Drill-Down Data Correspondence**
    - **Validates: Requirements 6.1**

  - [ ] 11.4 Integrate filters with all widgets
    - Connect AnalyticsFilters component to global filter state
    - Pass filters to all widget API calls
    - Implement filter change handlers
    - Add loading states during filter updates
    - _Requirements: 1.6_

  - [ ] 11.5 Implement report configuration persistence
    - Add save configuration button
    - Store configuration in localStorage or backend
    - Add load configuration dropdown
    - Implement configuration CRUD operations
    - _Requirements: 6.6_

  - [ ]* 11.6 Write property test for configuration persistence
    - **Property 13: Report Configuration Round-Trip**
    - **Validates: Requirements 6.6**

  - [ ] 11.7 Add real-time data updates
    - Implement polling mechanism (every 5 seconds) for new data
    - Update widget data without full page refresh
    - Add visual indicator for data updates
    - _Requirements: 6.7_

- [ ] 12. Checkpoint - Ensure frontend components render correctly
  - Test all widgets with sample data
  - Verify charts render correctly with Recharts
  - Test filter interactions
  - Test export and scheduling functionality
  - Ask the user if questions arise

- [ ] 13. Integration and error handling
  - [ ] 13.1 Add comprehensive error handling to all API calls
    - Wrap all fetch calls in try-catch blocks
    - Display user-friendly error messages in widgets
    - Implement retry mechanisms for failed requests
    - Log errors to console for debugging
    - _Requirements: All requirements_

  - [ ] 13.2 Add loading and empty states to all widgets
    - Implement skeleton loaders for initial load
    - Display "No data available" for empty datasets
    - Add loading spinners for filter updates
    - _Requirements: All requirements_

  - [ ] 13.3 Implement backend error responses
    - Standardize error response format
    - Add appropriate HTTP status codes
    - Include error details for debugging
    - Log errors server-side
    - _Requirements: All requirements_

  - [ ]* 13.4 Write unit tests for error handling
    - Test network error scenarios
    - Test invalid input handling
    - Test empty dataset handling
    - Test timeout scenarios

- [ ] 14. Performance optimization
  - [ ] 14.1 Add database indexes
    - Create index on appointments(date, doctor_id)
    - Create index on clinical_records(diagnosis, created_at)
    - Create index on medications(medicine_name)
    - Create index on users(role, prakruti)
    - _Requirements: 7.3_

  - [ ] 14.2 Implement query optimization
    - Review and optimize slow queries
    - Use database query EXPLAIN to identify bottlenecks
    - Implement pagination for large result sets
    - _Requirements: 7.3_

  - [ ] 14.3 Integrate caching in API routes
    - Add cache checks before expensive queries
    - Set appropriate TTL values (5 minutes for most analytics)
    - Implement cache invalidation on data updates
    - _Requirements: 7.4_

- [ ] 15. Final testing and polish
  - [ ]* 15.1 Run full property test suite
    - Execute all 23 property tests with 100+ iterations
    - Verify all properties pass
    - Fix any failing properties

  - [ ]* 15.2 Run unit test suite
    - Execute all unit tests
    - Verify 80%+ backend coverage
    - Verify 70%+ frontend coverage

  - [ ] 15.3 Manual testing of complete workflows
    - Test complete user journey: login → apply filters → view analytics → export report
    - Test scheduled report creation and execution
    - Test drill-down interactions across all widgets
    - Test widget customization and persistence
    - Test access control for doctor vs administrator roles

  - [ ] 15.4 UI/UX polish
    - Ensure consistent styling with existing Ayurvedic theme
    - Add smooth transitions and animations with Framer Motion
    - Verify responsive design on different screen sizes
    - Add tooltips and help text where needed

- [ ] 16. Final checkpoint - Complete feature verification
  - Ensure all tests pass
  - Verify all requirements are met
  - Test with production-like data volumes
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for course correction
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a bottom-up approach: database → services → API → UI
- All analytics widgets maintain the existing Ayurvedic aesthetic with Tailwind CSS
- Recharts is used for all data visualizations to maintain consistency
- Access control is enforced at both API and UI levels for security
