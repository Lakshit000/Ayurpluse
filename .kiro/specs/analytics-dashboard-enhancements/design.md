# Design Document: Analytics Dashboard Enhancements

## Overview

The Analytics Dashboard Enhancements feature extends the existing DoctorAnalytics.jsx component to provide comprehensive, data-driven insights for clinic management and doctors. The enhancement transforms the current basic analytics (patient retention, revenue, prakruti mix) into a full-featured analytics platform with interactive visualizations, customizable reports, scheduled report delivery, and drill-down capabilities.

The design follows a modular architecture where new analytics widgets can be added independently, data aggregation is optimized through caching and database indexing, and the UI maintains the existing Ayurvedic aesthetic while adding interactive capabilities through Recharts visualizations.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         DoctorAnalytics.jsx (Enhanced)                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Visit        │  │ Treatment    │  │ Revenue     │ │ │
│  │  │ Analytics    │  │ Analytics    │  │ Analytics   │ │ │
│  │  │ Widget       │  │ Widget       │  │ Widget      │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │ Doctor       │  │ Operational  │  │ Report      │ │ │
│  │  │ Performance  │  │ Efficiency   │  │ Generator   │ │ │
│  │  │ Widget       │  │ Widget       │  │ Widget      │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         AnalyticsFilters Component                     │ │
│  │  (Date Range, Demographics, Doctor Filter)             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         ReportExporter Component                       │ │
│  │  (PDF/CSV Export, Scheduled Reports)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Analytics API Routes                           │ │
│  │  /api/analytics/visits                                 │ │
│  │  /api/analytics/treatments                             │ │
│  │  /api/analytics/revenue                                │ │
│  │  /api/analytics/doctors                                │ │
│  │  /api/analytics/operations                             │ │
│  │  /api/analytics/export                                 │ │
│  │  /api/analytics/schedule-report                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Analytics Service Layer                        │ │
│  │  - Data Aggregation Functions                          │ │
│  │  - Query Optimization & Caching                        │ │
│  │  - Report Generation (PDF/CSV)                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                         │
│  - users                                                     │
│  - appointments                                              │
│  - clinical_records                                          │
│  - medications                                               │
│  - panchakarma_cycles                                        │
│  - dosha_history                                             │
│  - analytics_cache (new)                                     │
│  - scheduled_reports (new)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend Components:**
- **DoctorAnalytics.jsx**: Main container orchestrating all analytics widgets, manages global filters and state
- **AnalyticsWidget**: Reusable widget component with title, loading state, error handling, and drill-down support
- **AnalyticsFilters**: Centralized filter controls (date range, demographics, doctor selection)
- **ReportExporter**: Handles PDF/CSV export and scheduled report configuration
- **Individual Widget Components**: Visit, Treatment, Revenue, Doctor Performance, Operational Efficiency widgets

**Backend Services:**
- **Analytics Routes**: RESTful endpoints for each analytics category
- **Analytics Service**: Business logic for data aggregation, caching, and query optimization
- **Report Generator**: PDF and CSV generation using PDFKit and native Node.js
- **Report Scheduler**: Cron-like scheduling for automated report delivery via Nodemailer

## Components and Interfaces

### Frontend Components

#### 1. Enhanced DoctorAnalytics Component

```javascript
// Main analytics dashboard component
function DoctorAnalytics() {
  // State management
  const [filters, setFilters] = useState({
    dateRange: 'monthly',
    startDate: null,
    endDate: null,
    demographics: {},
    doctorId: null
  });
  
  const [widgets, setWidgets] = useState([
    { id: 'visits', enabled: true, position: 0 },
    { id: 'treatments', enabled: true, position: 1 },
    { id: 'revenue', enabled: true, position: 2 },
    { id: 'doctors', enabled: true, position: 3 },
    { id: 'operations', enabled: true, position: 4 }
  ]);
  
  const [drillDownData, setDrillDownData] = useState(null);
  
  // Fetch analytics data with filters
  // Render widgets based on configuration
  // Handle drill-down interactions
}
```

#### 2. AnalyticsWidget Component

```javascript
// Reusable widget wrapper
function AnalyticsWidget({ 
  title, 
  children, 
  loading, 
  error, 
  onExport, 
  onDrillDown 
}) {
  // Provides consistent styling, loading states, error handling
  // Supports export and drill-down actions
}
```

#### 3. AnalyticsFilters Component

```javascript
// Centralized filter controls
function AnalyticsFilters({ filters, onFilterChange }) {
  // Date range picker (daily, weekly, monthly, yearly, custom)
  // Demographics filters (age, gender, prakruti)
  // Doctor selection (for multi-doctor clinics)
  // Apply/Reset buttons
}
```

#### 4. ReportExporter Component

```javascript
// Export and scheduling interface
function ReportExporter({ 
  reportType, 
  filters, 
  onExport, 
  onSchedule 
}) {
  // Format selection (PDF, CSV)
  // Scheduled report configuration
  // Email recipient management
  // Export history
}
```

#### 5. Individual Analytics Widgets

**VisitAnalyticsWidget:**
- Line chart showing visit trends over time
- New vs returning patient ratio (pie chart)
- Visit frequency distribution (bar chart)
- Period comparison metrics

**TreatmentAnalyticsWidget:**
- Top diagnoses (horizontal bar chart)
- Medicine usage frequency (table with search)
- Panchakarma adoption rate (gauge chart)
- Dosha distribution (existing donut chart enhanced)
- Trending conditions (line chart with trend indicators)

**RevenueAnalyticsWidget:**
- Revenue trend line chart
- Revenue by treatment type (stacked bar chart)
- Average consultation fee (KPI card)
- Payment collection rate (progress bar)
- High-value patients (ranked list)
- Revenue forecast (projected line)

**DoctorPerformanceWidget:**
- Consultations per doctor (bar chart)
- Appointment completion rates (table)
- Follow-up compliance (percentage bars)
- Comparative performance (radar chart for multi-doctor)
- Prescription patterns (word cloud or frequency list)

**OperationalEfficiencyWidget:**
- Average consultation duration (KPI card)
- Appointment wait times (histogram)
- No-show/cancellation rates (pie chart)
- Medicine inventory usage (table)
- Patient flow bottlenecks (heatmap by time)
- System usage patterns (line chart by hour)

### Backend API Endpoints

#### Analytics Endpoints

```javascript
// Visit Analytics
GET /api/analytics/visits
Query params: startDate, endDate, period, demographics, doctorId
Response: {
  totalVisits: number,
  newPatients: number,
  returningPatients: number,
  visitsByPeriod: Array<{date, count, new, returning}>,
  frequencyDistribution: Array<{range, count}>
}

// Treatment Analytics
GET /api/analytics/treatments
Query params: startDate, endDate, doctorId
Response: {
  topDiagnoses: Array<{diagnosis, count, percentage}>,
  medicineUsage: Array<{medicine, count, frequency}>,
  panchakarmRate: number,
  doshaDistribution: {vata, pitta, kapha},
  trendingConditions: Array<{diagnosis, trend, changePercent}>
}

// Revenue Analytics
GET /api/analytics/revenue
Query params: startDate, endDate, period
Response: {
  revenueByPeriod: Array<{date, amount}>,
  revenueByType: Array<{type, amount}>,
  avgConsultationFee: number,
  collectionRate: number,
  highValuePatients: Array<{patientId, name, totalRevenue}>,
  forecast: Array<{date, projected}>
}

// Doctor Performance Analytics
GET /api/analytics/doctors
Query params: startDate, endDate, doctorId
Response: {
  consultationsPerDoctor: Array<{doctorId, name, count}>,
  completionRates: Array<{doctorId, name, rate}>,
  followUpCompliance: Array<{doctorId, name, rate}>,
  prescriptionPatterns: Array<{doctorId, medicines, frequency}>
}

// Operational Efficiency Analytics
GET /api/analytics/operations
Query params: startDate, endDate
Response: {
  avgConsultationDuration: number,
  avgWaitTime: number,
  noShowRate: number,
  cancellationRate: number,
  inventoryUsage: Array<{medicine, count}>,
  bottlenecks: Array<{timeSlot, appointmentCount, avgWait}>,
  usagePatterns: Array<{hour, activeUsers, actions}>
}

// Export Report
POST /api/analytics/export
Body: {
  reportType: string,
  format: 'pdf' | 'csv',
  filters: object,
  widgets: Array<string>
}
Response: File download or {downloadUrl}

// Schedule Report
POST /api/analytics/schedule-report
Body: {
  reportType: string,
  format: 'pdf' | 'csv',
  schedule: {frequency, dayOfWeek, time},
  recipients: Array<email>,
  filters: object
}
Response: {scheduleId, message}

// Get Scheduled Reports
GET /api/analytics/scheduled-reports
Response: Array<{id, reportType, schedule, recipients, lastRun}>

// Delete Scheduled Report
DELETE /api/analytics/scheduled-reports/:id
Response: {message}
```

### Backend Service Functions

```javascript
// Analytics Service Module

// Visit Analytics Functions
async function getVisitAnalytics(filters) {
  // Query appointments table with date filters
  // Aggregate by period (daily, weekly, monthly, yearly)
  // Calculate new vs returning ratios
  // Generate frequency distribution
  // Return structured data
}

// Treatment Analytics Functions
async function getTreatmentAnalytics(filters) {
  // Query clinical_records for diagnoses
  // Aggregate medicine prescriptions from medications table
  // Calculate Panchakarma adoption from panchakarma_cycles
  // Query dosha_history for distribution
  // Identify trending conditions by comparing periods
}

// Revenue Analytics Functions
async function getRevenueAnalytics(filters) {
  // Aggregate appointment fees by period
  // Group revenue by appointment type
  // Calculate averages and collection rates
  // Identify high-value patients
  // Apply linear regression for forecasting
}

// Doctor Performance Functions
async function getDoctorPerformanceAnalytics(filters) {
  // Count consultations per doctor
  // Calculate completion rates from appointments
  // Track follow-up compliance
  // Analyze prescription patterns per doctor
}

// Operational Efficiency Functions
async function getOperationalAnalytics(filters) {
  // Calculate time differences for durations
  // Aggregate no-show and cancellation counts
  // Query medicine usage from medications
  // Identify time-based bottlenecks
  // Track audit_logs for usage patterns
}

// Caching Functions
async function getCachedAnalytics(cacheKey, ttl) {
  // Check analytics_cache table
  // Return cached data if fresh (within TTL)
  // Return null if expired or missing
}

async function setCachedAnalytics(cacheKey, data, ttl) {
  // Store analytics data in cache table
  // Set expiration timestamp
}

// Report Generation Functions
async function generatePDFReport(reportData, widgets) {
  // Use PDFKit to create formatted PDF
  // Include charts as images (rendered server-side or embedded)
  // Add tables for detailed data
  // Return PDF buffer
}

async function generateCSVReport(reportData, widgets) {
  // Convert analytics data to CSV format
  // Include headers and formatted rows
  // Return CSV string
}

// Report Scheduling Functions
async function scheduleReport(config) {
  // Store schedule in scheduled_reports table
  // Set up cron-like trigger (using node-cron or similar)
  // Return schedule ID
}

async function executeScheduledReport(scheduleId) {
  // Fetch schedule configuration
  // Generate report with stored filters
  // Send via email using Nodemailer
  // Update last_run timestamp
}
```

## Data Models

### New Database Tables

#### analytics_cache Table

```sql
CREATE TABLE IF NOT EXISTS analytics_cache (
  cache_key TEXT PRIMARY KEY,
  data TEXT,  -- JSON stringified analytics data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
```

Purpose: Store frequently accessed analytics aggregations to improve performance.

#### scheduled_reports Table

```sql
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  report_type TEXT,  -- 'visits', 'treatments', 'revenue', 'doctors', 'operations', 'full'
  format TEXT,  -- 'pdf' or 'csv'
  schedule_frequency TEXT,  -- 'daily', 'weekly', 'monthly'
  schedule_day INTEGER,  -- Day of week (0-6) or day of month (1-31)
  schedule_time TEXT,  -- HH:MM format
  recipients TEXT,  -- JSON array of email addresses
  filters TEXT,  -- JSON stringified filter object
  widgets TEXT,  -- JSON array of widget IDs to include
  last_run DATETIME,
  next_run DATETIME,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Purpose: Store scheduled report configurations for automated delivery.

### Enhanced Existing Tables

No schema changes required for existing tables. The analytics will query:
- **users**: Patient demographics, prakruti, registration dates
- **appointments**: Visit data, types, dates, doctor assignments, status
- **clinical_records**: Diagnoses, treatments, timestamps
- **medications**: Prescriptions, medicine names, dosages
- **panchakarma_cycles**: Treatment adoption, completion status
- **dosha_history**: Prakruti/Vikruti tracking over time
- **audit_logs**: System usage patterns, user actions

### Data Transfer Objects (DTOs)

```javascript
// Visit Analytics DTO
{
  totalVisits: number,
  newPatients: number,
  returningPatients: number,
  newVsReturningRatio: number,
  visitsByPeriod: [
    {
      date: string,  // ISO date or period label
      count: number,
      newCount: number,
      returningCount: number
    }
  ],
  frequencyDistribution: [
    {
      range: string,  // "1-2 visits", "3-5 visits", etc.
      count: number,
      percentage: number
    }
  ],
  periodComparison: {
    currentPeriod: object,
    previousPeriod: object,
    percentageChange: number
  }
}

// Treatment Analytics DTO
{
  topDiagnoses: [
    {
      diagnosis: string,
      count: number,
      percentage: number,
      trend: 'up' | 'down' | 'stable'
    }
  ],
  medicineUsage: [
    {
      medicine: string,
      count: number,
      frequency: number,
      patients: number
    }
  ],
  panchakarmRate: number,
  doshaDistribution: {
    vata: number,
    pitta: number,
    kapha: number
  },
  trendingConditions: [
    {
      diagnosis: string,
      currentCount: number,
      previousCount: number,
      changePercent: number,
      trend: 'increasing' | 'decreasing'
    }
  ],
  treatmentOutcomes: [
    {
      diagnosis: string,
      successRate: number,
      avgTreatmentDuration: number
    }
  ]
}

// Revenue Analytics DTO
{
  revenueByPeriod: [
    {
      date: string,
      amount: number,
      consultations: number
    }
  ],
  revenueByType: [
    {
      type: string,  // 'consultation', 'follow-up', 'panchakarma'
      amount: number,
      percentage: number
    }
  ],
  avgConsultationFee: number,
  collectionRate: number,
  outstandingAmount: number,
  highValuePatients: [
    {
      patientId: number,
      name: string,
      totalRevenue: number,
      visitCount: number
    }
  ],
  forecast: [
    {
      date: string,
      projected: number,
      confidence: number
    }
  ]
}

// Doctor Performance DTO
{
  consultationsPerDoctor: [
    {
      doctorId: number,
      name: string,
      count: number,
      percentage: number
    }
  ],
  completionRates: [
    {
      doctorId: number,
      name: string,
      scheduled: number,
      completed: number,
      rate: number
    }
  ],
  followUpCompliance: [
    {
      doctorId: number,
      name: string,
      recommended: number,
      completed: number,
      rate: number
    }
  ],
  prescriptionPatterns: [
    {
      doctorId: number,
      name: string,
      topMedicines: Array<string>,
      uniquePrescriptions: number,
      avgMedicinesPerVisit: number
    }
  ]
}

// Operational Efficiency DTO
{
  avgConsultationDuration: number,  // minutes
  avgWaitTime: number,  // minutes
  noShowRate: number,  // percentage
  cancellationRate: number,  // percentage
  inventoryUsage: [
    {
      medicine: string,
      count: number,
      trend: 'up' | 'down' | 'stable'
    }
  ],
  bottlenecks: [
    {
      timeSlot: string,  // "09:00-10:00"
      dayOfWeek: string,
      appointmentCount: number,
      avgWaitTime: number
    }
  ],
  usagePatterns: [
    {
      hour: number,  // 0-23
      activeUsers: number,
      actions: number
    }
  ]
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated:
- Multiple percentage calculation properties (1.2, 2.3, 2.4, 3.4, 4.2, 4.3, 4.4, 5.3) share the same underlying logic
- Multiple aggregation properties (1.1, 2.1, 2.2, 3.1, 3.2, 4.1, 5.4, 5.6) follow similar patterns
- Multiple ranking properties (2.1, 3.5) use the same sorting logic
- Access control properties (8.1, 8.2, 8.3) can be combined into role-based access verification

The following properties represent the unique, non-redundant correctness guarantees:

### Data Aggregation Properties

**Property 1: Time Period Aggregation Correctness**
*For any* set of visit records and any time period filter (daily, weekly, monthly, yearly), the sum of visits across all aggregated periods should equal the total number of visits in the dataset.
**Validates: Requirements 1.1, 3.1**

**Property 2: Grouping Preserves Totals**
*For any* dataset and any grouping criteria (diagnosis, medicine, treatment type, doctor), the sum of counts across all groups should equal the total count in the original dataset.
**Validates: Requirements 2.1, 2.2, 3.2, 4.1, 5.4**

**Property 3: Visit Frequency Distribution Completeness**
*For any* set of patient visit histories, every patient should appear in exactly one frequency range bucket, and the sum of all bucket counts should equal the total number of unique patients.
**Validates: Requirements 1.3**

### Calculation Properties

**Property 4: Ratio Calculation Correctness**
*For any* set of visits classified as new or returning, the ratio of new to returning patients should equal (new count / returning count), and (new + returning) should equal total visits.
**Validates: Requirements 1.2**

**Property 5: Percentage Calculation Correctness**
*For any* dataset with a subset meeting specific criteria, the percentage should equal (subset count / total count) × 100, and all percentages in a complete partition should sum to 100%.
**Validates: Requirements 2.3, 2.4, 3.4, 4.2, 4.3, 4.4, 5.3**

**Property 6: Average Calculation Correctness**
*For any* set of numeric values, the calculated average should equal the sum of all values divided by the count of values.
**Validates: Requirements 3.3, 5.1, 5.2**

**Property 7: Period Comparison Percentage Change**
*For any* two time periods with measured values V1 and V2, the percentage change should equal ((V2 - V1) / V1) × 100.
**Validates: Requirements 1.4, 2.5**

### Ranking and Sorting Properties

**Property 8: Ranking Order Correctness**
*For any* ranked list of items by a numeric metric, each item should have a value greater than or equal to the next item in the list, and the top N items should be the N items with the highest values in the dataset.
**Validates: Requirements 2.1, 3.5**

### Filtering Properties

**Property 9: Filter Inclusivity**
*For any* dataset and any filter criteria (demographics, date range, doctor), every record in the filtered result should match all filter criteria, and every record in the original dataset that matches all criteria should appear in the result.
**Validates: Requirements 1.6, 8.2**

**Property 10: Trend Detection Consistency**
*For any* diagnosis with counts C1 in period 1 and C2 in period 2, if C2 > C1 then trend should be "increasing", if C2 < C1 then trend should be "decreasing", otherwise trend should be "stable".
**Validates: Requirements 2.5**

### Data Export Properties

**Property 11: CSV Export Round-Trip Integrity**
*For any* analytics dataset, exporting to CSV and parsing back should preserve all required fields (timestamps, IDs, types, values) with equivalent values.
**Validates: Requirements 1.5, 6.5**

**Property 12: PDF Export Completeness**
*For any* selected set of widgets and data, the generated PDF should contain representations of all selected visualizations and all data tables specified in the export request.
**Validates: Requirements 6.4**

**Property 13: Report Configuration Round-Trip**
*For any* report configuration (filters, date ranges, widget selections), saving and then loading the configuration should produce an equivalent configuration object.
**Validates: Requirements 6.6**

### State Management Properties

**Property 14: Widget Configuration Consistency**
*For any* widget operation (add, remove, reorder), the resulting widget list should reflect the operation correctly: add increases count by 1, remove decreases count by 1, reorder preserves count but changes positions.
**Validates: Requirements 6.2**

**Property 15: Drill-Down Data Correspondence**
*For any* chart element clicked, the drill-down data should be a subset of the original aggregated data, filtered to match the clicked element's criteria.
**Validates: Requirements 6.1**

### Caching Properties

**Property 16: Cache Freshness**
*For any* cached analytics data with TTL T, if the cache age is less than T, the cached data should be returned; if the cache age is greater than or equal to T, fresh data should be fetched and cached.
**Validates: Requirements 7.4**

### Access Control Properties

**Property 17: Role-Based Access Control**
*For any* user attempting to access analytics, if the user role is "doctor" then only their own patient data should be accessible, if the user role is "administrator" then all clinic data should be accessible, otherwise access should be denied.
**Validates: Requirements 8.1, 8.2, 8.3**

**Property 18: Data Anonymization in Exports**
*For any* exported report where anonymization is required, all patient identifiers (names, IDs) should be replaced with anonymized tokens, and the mapping should be consistent within a single export.
**Validates: Requirements 8.4**

**Property 19: Audit Logging Completeness**
*For any* analytics access event, an audit log entry should be created containing the user ID, timestamp, and report type, and the entry should be persisted before the analytics data is returned.
**Validates: Requirements 8.5**

### Scheduling Properties

**Property 20: Report Schedule Execution**
*For any* scheduled report with frequency F and time T, when the current time matches the next scheduled execution time, the report should be generated with the stored configuration and sent to all specified recipients.
**Validates: Requirements 6.3**

### Operational Efficiency Properties

**Property 21: Bottleneck Identification Criteria**
*For any* time slot with appointment count A and average wait time W, if A exceeds the high-density threshold AND W exceeds the long-wait threshold, then the time slot should be identified as a bottleneck.
**Validates: Requirements 5.5**

**Property 22: Peak Usage Hour Identification**
*For any* set of hourly usage data, the peak usage hours should be the hours with the highest activity counts, and they should be ranked in descending order by activity count.
**Validates: Requirements 5.6**

### Forecasting Properties

**Property 23: Revenue Forecast Trend Alignment**
*For any* historical revenue data with a positive trend, the forecasted values should show an increasing pattern; for negative trends, forecasted values should show a decreasing pattern; for stable trends, forecasted values should remain relatively constant.
**Validates: Requirements 3.6**

## Error Handling

### Frontend Error Handling

**Network Errors:**
- All API calls wrapped in try-catch blocks
- Display user-friendly error messages in widget error states
- Provide retry mechanisms for failed requests
- Log errors to console for debugging

**Data Validation Errors:**
- Validate filter inputs before sending to backend
- Display validation errors inline with form fields
- Prevent invalid date ranges (end before start)
- Validate numeric inputs for thresholds

**Chart Rendering Errors:**
- Gracefully handle empty datasets (show "No data available" message)
- Handle malformed data with fallback to empty state
- Catch Recharts rendering exceptions
- Display error boundaries for widget crashes

**Export Errors:**
- Handle PDF generation failures with error modal
- Validate export parameters before submission
- Provide download retry on failure
- Show progress indicators for large exports

### Backend Error Handling

**Database Errors:**
- Wrap all database queries in try-catch
- Return 500 status with error message on query failures
- Log database errors with stack traces
- Implement connection retry logic

**Query Timeout Handling:**
- Set query timeout limits (3 seconds)
- Return 408 Request Timeout status
- Allow client-side cancellation
- Log slow queries for optimization

**Data Aggregation Errors:**
- Validate input parameters (dates, IDs)
- Return 400 Bad Request for invalid inputs
- Handle division by zero in calculations (return 0 or null)
- Validate data types before calculations

**Report Generation Errors:**
- Catch PDFKit exceptions during PDF generation
- Handle CSV formatting errors
- Return 500 status with descriptive error message
- Clean up temporary files on error

**Email Delivery Errors:**
- Catch Nodemailer exceptions
- Log failed email deliveries
- Retry failed deliveries (max 3 attempts)
- Update scheduled report status on failure

**Cache Errors:**
- Handle cache read/write failures gracefully
- Fall back to direct database queries on cache miss
- Log cache errors without blocking requests
- Implement cache invalidation on errors

### Error Response Format

```javascript
{
  error: true,
  message: "User-friendly error message",
  code: "ERROR_CODE",
  details: "Technical details for debugging",
  timestamp: "ISO timestamp"
}
```

### Access Control Errors

**Authentication Errors:**
- Return 401 Unauthorized for missing/invalid tokens
- Redirect to login page on frontend
- Clear invalid tokens from storage

**Authorization Errors:**
- Return 403 Forbidden for insufficient permissions
- Display "Access Denied" message
- Log unauthorized access attempts

## Testing Strategy

### Dual Testing Approach

The analytics dashboard enhancements require both unit tests and property-based tests to ensure correctness:

**Unit Tests** focus on:
- Specific examples of calculations (e.g., calculating percentage for known values)
- Edge cases (empty datasets, single data point, null values)
- Error conditions (invalid inputs, network failures)
- Integration points (API endpoint responses, database queries)
- UI interactions (button clicks, filter changes)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs (aggregation correctness, percentage calculations)
- Data transformation invariants (export/import round-trips)
- Mathematical properties (averages, ratios, rankings)
- Access control rules across all user roles
- Caching behavior across different TTL values

### Property-Based Testing Configuration

**Library Selection:**
- **Frontend (JavaScript/React)**: Use `fast-check` library for property-based testing
- **Backend (Node.js)**: Use `fast-check` library for property-based testing

**Test Configuration:**
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `Feature: analytics-dashboard-enhancements, Property {number}: {property_text}`

**Example Property Test Structure:**

```javascript
// Example: Property 1 - Time Period Aggregation Correctness
import fc from 'fast-check';

test('Feature: analytics-dashboard-enhancements, Property 1: Time Period Aggregation Correctness', () => {
  fc.assert(
    fc.property(
      fc.array(visitRecordArbitrary),
      fc.constantFrom('daily', 'weekly', 'monthly', 'yearly'),
      (visits, period) => {
        const aggregated = aggregateByPeriod(visits, period);
        const totalAggregated = aggregated.reduce((sum, p) => sum + p.count, 0);
        const totalOriginal = visits.length;
        return totalAggregated === totalOriginal;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

**Unit Test Coverage:**
- 80%+ code coverage for analytics service functions
- 70%+ coverage for React components
- 100% coverage for critical calculation functions

**Property Test Coverage:**
- All 23 correctness properties implemented as property tests
- Each acceptance criterion with "yes - property" in prework has a corresponding test

### Testing Tools

**Frontend Testing:**
- Jest for unit tests
- React Testing Library for component tests
- fast-check for property-based tests
- MSW (Mock Service Worker) for API mocking

**Backend Testing:**
- Jest for unit tests
- Supertest for API endpoint tests
- fast-check for property-based tests
- SQLite in-memory database for test isolation

### Test Data Generation

**Generators for Property Tests:**
- `visitRecordArbitrary`: Generates random visit records with dates, patient IDs, types
- `patientArbitrary`: Generates random patient data with demographics, prakruti
- `revenueRecordArbitrary`: Generates random revenue transactions
- `appointmentArbitrary`: Generates random appointments with statuses, times
- `clinicalRecordArbitrary`: Generates random diagnoses and treatments
- `userArbitrary`: Generates random users with roles (doctor, admin, patient)

**Edge Case Generators:**
- Empty arrays
- Single-element arrays
- Arrays with duplicate values
- Null and undefined values
- Extreme dates (far past, far future)
- Large datasets (1000+ records)

### Integration Testing

**API Integration Tests:**
- Test each analytics endpoint with real database
- Verify response formats match DTOs
- Test filter combinations
- Verify access control enforcement

**End-to-End Tests:**
- Test complete user workflows (apply filters → view charts → export report)
- Test scheduled report execution
- Test drill-down interactions
- Test widget customization persistence

### Performance Testing

While not part of unit/property tests, performance should be validated separately:
- Load testing with large datasets (10,000+ records)
- Measure query execution times
- Verify cache effectiveness
- Test concurrent user access

### Continuous Integration

- Run all tests on every commit
- Fail builds on test failures
- Generate coverage reports
- Run property tests with increased iterations (500+) on main branch
