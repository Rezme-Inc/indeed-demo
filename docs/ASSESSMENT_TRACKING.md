# Assessment Tracking System Documentation

## Overview

The Assessment Tracking System is a comprehensive solution for tracking HR admin activities during the Fair Chance hiring assessment process. It provides complete audit trails, document storage, and compliance reporting capabilities.

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

The `assessmentTracking` service (`src/lib/services/assessmentTracking.ts`) provides:

- Session management (create, update, complete)
- Step tracking (save answers and progress)
- Document storage (save all generated documents)
- Audit logging (track all user actions)
- Comprehensive reporting (generate full assessment records)

## Implementation Details

### 1. Session Initialization

When an HR admin starts an assessment:

```typescript
const sessionId = await assessmentTracking.getOrCreateSession(
  hrAdminId,
  candidateId
);
```

### 2. Progress Tracking

As the HR admin answers questions:

```typescript
await assessmentTracking.saveStep(stepNumber, questionId, answer, notes);
```

### 3. Document Saving

When documents are generated and sent:

```typescript
await assessmentTracking.saveDocument("offer_letter", documentData, true);
```

### 4. Action Logging

All significant actions are logged:

```typescript
await assessmentTracking.logAction(hrAdminId, "offer_letter_sent", {
  recipient_email,
});
```

### 5. Session Completion

When a final decision is made:

```typescript
await assessmentTracking.completeSession("hired" | "revoked");
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

### Phase 1 (Completed)

- ✅ Basic session tracking
- ✅ Document storage
- ✅ Audit logging
- ✅ Admin viewing interface

### Phase 2 (Planned)

- [ ] Time tracking (duration on each step)
- [ ] Analytics dashboard
- [ ] Automated compliance reports
- [ ] Bulk export functionality

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
