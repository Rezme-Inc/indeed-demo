# HR Admin Dashboard Components

This document outlines the main React components used within the HR admin dashboard pages located in `src/app/hr-admin/dashboard`. The folder contains three primary pages:

1. `page.tsx` – the main HR admin dashboard
2. `[userId]/page.tsx` – candidate profile view
3. `[userId]/assessment/page.tsx` – the assessment workflow

For each page, the tables below summarize its components and their responsibilities.

## 1. HR Admin Dashboard (`page.tsx`)

| Component | Description |
|-----------|------------|
| `AssessmentMetrics` | Displays counts for invites sent, in‑progress assessments and completed assessments. Includes a modal to view candidate lists and reinvite candidates. |
| `CandidateTable` | Table of candidates with search and actions to view profile or start an assessment. Each row renders a `CandidateRow`. |
| `InviteCandidateModal` | Modal form used to send email invitations to candidates. |
| `InvitationCodeCard` | Shows the HR admin's invitation code and actions to generate a new code or send an invite. |
| `ToolkitResourcesCard` | Links to official Fair Chance resources for HR teams. |

Additional hooks such as `useHRAdminProfile`, `usePermittedUsers` and `useHrInvites` handle profile loading, permitted user lists and sent invitation tracking.

## 2. Candidate Profile (`[userId]/page.tsx`)

This page fetches the candidate's profile and restorative record data from Supabase. Content is organized into tabs. Each tab is implemented as its own component under `[userId]/tabs`.

| Tab Component | Purpose |
|---------------|---------|
| `OverviewTab` | Shows the introduction, social links and quick statistics about the restorative record. |
| `EducationTab` | Lists educational history entries. |
| `EmploymentTab` | Displays employment history. |
| `AchievementsTab` | Shows awards and micro‑credentials. |
| `SkillsTab` | Lists soft and hard skills. |
| `CommunityTab` | Community engagements and mentor information. |
| `PersonalTab` | Candidate hobbies and interests. |
| `ProgramsTab` | Rehabilitative program participation. |

The header of the page provides a back button to the dashboard and a button to begin the assessment for the candidate.

## 3. Assessment Workflow (`[userId]/assessment/page.tsx`)

The assessment page wraps its content with `AssessmentProvider` to manage assessment state. Numerous components are organized in sub‑folders:

### Layout Components

| Component | Description |
|-----------|------------|
| `AssessmentHeader` | Sticky header with navigation back to the dashboard, document dropdown, upload button and HR profile display. |
| `AssessmentProgressBar` | Indicates progress through the five assessment phases. |
| `TimelinePanel` | Slide‑in panel showing a timeline of HR actions and uploaded documents. |
| `Footer` | Static footer with disclaimers. |

### Candidate & Common Components

| Component | Description |
|-----------|------------|
| `CandidateInfoBox` | Sidebar card containing a button to view the candidate's restorative record response. |
| `CandidateResponseModal` | Modal viewer for the shared restorative record, loaded via iframe. |
| `FairChanceOverviewBox` | Sidebar card linking to a summary of the San Diego Fair Chance ordinance. |
| `OrdinanceSummary` | Full page modal describing the ordinance. |
| `ExtendSuccessModal` | Small modal displayed when a hire decision is recorded. |

### Document Components

| Component | Description |
|-----------|------------|
| `DocumentUploadPanel` | Slide‑in panel for uploading background checks, job descriptions, emails and other documents used during the assessment. |
| `DocumentViewer` | Modal viewer for uploaded files (PDF or image). |
| `DocumentMetadata` | Displays metadata such as sent date and admin name when rendering documents. |
| `PrintButton` | Simple button to trigger printing of PDF documents. |

### Assessment Steps

The assessment consists of five main steps plus a final summary step. Each step lives in `components/steps/stepX` and may include its own modal `view` components.

| Step Component | Purpose |
|----------------|--------|
| `Step1` with `ConditionalJobOfferLetter` | Confirms a conditional job offer and can generate an offer letter. |
| `Step2` with `IndividualizedAssessmentModal` | Collects individualized assessment details and can record a hire decision. |
| `Step3` with `PreliminaryRevocationModal` | Handles issuing a preliminary job offer revocation. |
| `Step4` with `IndividualizedReassessmentForm` | Allows reassessment after the candidate responds to the revocation. |
| `Step5` with `FinalRevocationModal` and success components | Issues a final revocation notice when necessary. |
| `Step6` | Final review step summarizing the process. |

These steps use context hooks (`useAssessmentSteps`, `useAssessmentStorage` etc.) to persist answers and documents so that progress is saved locally.

---
