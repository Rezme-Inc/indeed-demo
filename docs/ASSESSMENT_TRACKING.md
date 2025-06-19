# Assessment Tracking System Documentation

## Overview

The Assessment Tracking System is a comprehensive solution for tracking HR admin activities during the Fair Chance hiring assessment process. It provides complete audit trails, document storage, and compliance reporting capabilities.

## Current Implementation Status

✅ **Fully Implemented Features:**

- Session initialization and tracking
- Answer/step tracking with notes
- Document tracking for all 5 document types
- Audit logging
- Safe wrapper to prevent UI breakage
- Debug tools for developers
- LocalStorage preservation (runs in parallel)
- Session completion tracking

## Architecture

### Database Schema

The system uses four main tables in Supabase:

1. **assessment_sessions**

   - Tracks each assessment session between an HR admin and a candidate
   - Links to both hr_admin_profiles and user_profiles
   - Stores final hiring decision and session metadata

2. **assessment_steps**

   - Records each step/question answered during the assessment
   - Maintains the exact answers and any notes
   - Preserves the order and timing of decisions

3. **assessment_documents**

   - Stores all generated documents (offer letters, assessments, notices)
   - Tracks when documents were created and sent
   - Maintains complete document data in JSON format

4. **assessment_audit_log**
   - Records every action taken during the assessment
   - Includes timestamps, IP addresses, and user agents
   - Provides complete audit trail for compliance

### Service Layer

The system provides two service layers:

1. **`assessmentTracking` service** (`src/lib/services/assessmentTracking.ts`)

   - Core tracking functionality
   - Session management, step tracking, document storage, audit logging

2. **`safeAssessmentTracking` wrapper** (`src/lib/services/safeAssessmentTracking.ts`)
   - Safe wrapper that catches all errors
   - Ensures tracking failures don't break the UI
   - Returns success/failure status for debugging

## Implementation Details

### 1. Session Initialization

When an HR admin starts an assessment, tracking is automatically initialized:

```typescript
// Automatic initialization on page load
useEffect(() => {
  const initTracking = async () => {
    const { success, sessionId } =
      await safeAssessmentTracking.getOrCreateSession(hrAdminId, params.userId);
    if (success && sessionId) {
      setAssessmentSessionId(sessionId);
      setTrackingActive(true);
    }
  };
  initTracking();
}, [hrAdminId, params.userId]);
```

### 2. Progress Tracking

Answers are saved in parallel with localStorage:

```typescript
// Save to localStorage (preserved)
localStorage.setItem(
  `assessmentAnswers_${candidateId}`,
  JSON.stringify(answers)
);

// Also save to database (non-blocking)
if (assessmentSessionId) {
  safeAssessmentTracking.saveStep(
    assessmentSessionId,
    currentStep + 1,
    questionId,
    answer,
    notes[currentStep]
  );
}
```

### 3. Document Saving

All 5 document types are tracked when sent:

```typescript
// Example: Tracking offer letter
if (assessmentSessionId) {
  safeAssessmentTracking.saveDocument(
    assessmentSessionId,
    "conditional_offer_letter",
    {
      recipientEmail: email,
      recipientName: name,
      jobTitle,
      companyName,
      content: letterContent,
    },
    true // Document was sent
  );
}
```

Document types tracked:

- `conditional_offer_letter`
- `individual_assessment`
- `preliminary_revocation_notice`
- `reassessment`
- `final_revocation_notice`

### 4. Session Completion

Sessions are automatically completed when final decisions are made:

```typescript
// When hiring
safeAssessmentTracking.completeSession(assessmentSessionId, "hired");

// When revoking
safeAssessmentTracking.completeSession(assessmentSessionId, "revoked");
```

## Debug Features

### Debug DB Button

In development mode, a "Debug DB" button provides comprehensive tracking information:

```typescript
// Shows in console:
- Current session state
- All saved steps/answers
- Document tracking status
- Audit log entries
- LocalStorage comparison
```

### Console Logging

All tracking activities are logged to console:

```
[Assessment Tracking] Session initialized: <session-id>
[Assessment Tracking] Step saved successfully
[Assessment Tracking] Document saved: conditional_offer_letter
[Assessment Tracking] Session completed: hired
```

## SQL Queries for Monitoring

### View Complete Assessment Data

```sql
-- View complete assessment tracking data
WITH session_summary AS (
  SELECT
    s.id as session_id,
    s.created_at as started_at,
    s.completed_at,
    s.final_decision,
    h.first_name || ' ' || h.last_name as hr_admin_name,
    u.first_name || ' ' || u.last_name as candidate_name,
    u.email as candidate_email,
    h.company
  FROM assessment_sessions s
  JOIN hr_admin_profiles h ON s.hr_admin_id = h.id
  JOIN user_profiles u ON s.candidate_id = u.id
  ORDER BY s.created_at DESC
  LIMIT 10
)
-- Sessions
SELECT
  'SESSION' as record_type,
  session_id,
  hr_admin_name as field1,
  candidate_name as field2,
  candidate_email as field3,
  company as field4,
  started_at::text as field5,
  COALESCE(completed_at::text, 'In Progress') as field6,
  CASE
    WHEN final_decision = 'hired' THEN '✅ HIRED'
    WHEN final_decision = 'revoked' THEN '❌ REVOKED'
    WHEN final_decision = 'in_progress' THEN '⏳ In Progress'
    ELSE COALESCE(final_decision, 'Not Set')
  END as field7
FROM session_summary

UNION ALL

-- Documents
SELECT
  'DOCUMENT' as record_type,
  d.session_id,
  d.document_type as field1,
  CASE WHEN d.sent_at IS NOT NULL THEN 'Sent ✓' ELSE 'Draft' END as field2,
  '' as field3,
  '' as field4,
  d.created_at::text as field5,
  COALESCE(d.sent_at::text, 'Not sent') as field6,
  LEFT(d.document_data::text, 100) || '...' as field7
FROM assessment_documents d
WHERE d.session_id IN (SELECT session_id FROM session_summary)

UNION ALL

-- Steps
SELECT
  'STEP' as record_type,
  st.session_id,
  'Step ' || st.step_number as field1,
  st.question_id as field2,
  st.answer as field3,
  COALESCE(st.notes, 'No notes') as field4,
  st.created_at::text as field5,
  '' as field6,
  '' as field7
FROM assessment_steps st
WHERE st.session_id IN (SELECT session_id FROM session_summary)
ORDER BY record_type, session_id, field5;
```

### Quick Document Summary

```sql
-- Simple document view
SELECT
  s.id as session_id,
  u.email as candidate_email,
  h.email as hr_admin_email,
  d.document_type,
  d.sent_at,
  d.created_at,
  s.final_decision
FROM assessment_sessions s
JOIN assessment_documents d ON d.session_id = s.id
JOIN user_profiles u ON s.candidate_id = u.id
JOIN hr_admin_profiles h ON s.hr_admin_id = h.id
ORDER BY s.created_at DESC, d.created_at;
```

## Best Practices Implemented

### 1. Data Integrity

- All database operations use transactions where appropriate
- Foreign key constraints ensure referential integrity
- Immutable audit logs prevent tampering

### 2. Security

- Row Level Security (RLS) policies restrict access
- Sensitive data is encrypted at rest
- IP addresses and user agents are logged for security audits

### 3. Performance

- Efficient indexes on frequently queried columns
- Pagination support for large datasets
- Optimized queries with proper joins

### 4. Compliance

- Complete audit trail for every action
- Document versioning and timestamps
- Export capabilities for regulatory requests
- One-year retention policy aligned with legal requirements

### 5. User Experience

- Real-time progress saving
- Automatic session recovery
- No data loss on navigation
- Clear visual feedback

### 6. Maintainability

- Modular service architecture
- TypeScript for type safety
- Comprehensive error handling
- Clear separation of concerns

## Usage

### For Developers

1. **Adding New Tracking Points**

   ```typescript
   // Import the service
   import { assessmentTracking } from "@/lib/services/assessmentTracking";

   // Track an action
   await assessmentTracking.logAction(userId, "action_name", { details });
   ```

2. **Retrieving Assessment Records**
   ```typescript
   const record = await assessmentTracking.getAssessmentRecord(sessionId);
   ```

### For HR Admins

The system automatically tracks:

- When you view a candidate's profile
- Each question you answer
- Documents you generate and send
- Time spent on each step
- Your final hiring decision

### For Rezme Admins

Access the admin portal at `/admin/assessments` to:

- View all assessment sessions
- Filter by HR admin or candidate
- Export complete assessment records
- Generate compliance reports

## Future Enhancements

### Phase 1 (Completed) ✅

- ✅ Basic session tracking
- ✅ Document storage
- ✅ Audit logging
- ✅ Admin viewing interface
- ✅ Safe wrapper implementation
- ✅ Debug tools
- ✅ LocalStorage preservation

### Phase 2 (In Progress)

- [ ] Time tracking (duration on each step)
- [ ] Analytics dashboard
- [ ] Automated compliance reports
- [ ] Bulk export functionality
- [ ] Admin portal UI improvements

### Phase 3 (Future)

- [ ] Machine learning insights
- [ ] Anomaly detection
- [ ] Predictive analytics
- [ ] Integration with external compliance systems

## Compliance Notes

This system is designed to meet requirements for:

- San Diego Fair Chance Ordinance
- California Fair Chance Act
- EEOC guidelines
- General audit and compliance standards

All data is:

- Retained for minimum one year
- Exportable in standard formats
- Timestamped and immutable
- Accessible for audit purposes

## Testing

Run the test suite:

```bash
npm test src/lib/services/__tests__/assessmentTracking.test.ts
```

## Support

For questions or issues:

- Technical: dev@rezme.com
- Compliance: compliance@rezme.com
- General: support@rezme.com
