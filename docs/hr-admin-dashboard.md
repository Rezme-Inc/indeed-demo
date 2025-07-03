# HR Admin Dashboard Code Overview

This document explains the structure of the `src/app/hr-admin/dashboard` folder and how each page uses context providers and custom hooks. The dashboard is composed of three main pages:

1. **HR Admin Dashboard** – `src/app/hr-admin/dashboard/page.tsx`
2. **User Profile** – `src/app/hr-admin/dashboard/[userId]/page.tsx`
3. **Assessment** – `src/app/hr-admin/dashboard/[userId]/assessment/page.tsx`

## Folder Structure

```
src/app/hr-admin/dashboard/
├── components/        # Shared UI for the dashboard
├── [userId]/          # Candidate specific pages
│   ├── assessment/    # Assessment workflow components
│   └── tabs/          # Profile tab components
└── page.tsx           # Main dashboard page
```

Supporting context providers live under `src/context` and reusable logic is placed in `src/hooks`.

## Context Providers

The assessment workflow relies on a set of context providers that preserve state across page reloads:

| Context File | Purpose |
|--------------|---------|
| `AssessmentProvider.tsx` | Combines all assessment related providers for convenience. |
| `useAssessmentSteps.tsx` | Tracks the current step, answers and notes. |
| `AssessmentStorageProvider.tsx` | Exposes `useStepXStorage` hooks for each form (offer letter, assessment, revocation, etc.) so data is saved to `localStorage`. |
| `useCandidateData.tsx` | Holds candidate share token, profile information and timeline data. |
| `useDocumentUploads.tsx` | Manages uploaded document files and viewer state. |

Each page below interacts with one or more of these providers.

## HR Admin Dashboard Page

**File:** `src/app/hr-admin/dashboard/page.tsx`

This page shows the HR admin a list of permitted users and invitation tools. It makes extensive use of custom hooks:

- `useHRAdminProfile` – Loads the admin's profile from Supabase.
- `usePermittedUsers` – Retrieves all users who granted access to this HR admin.
- `useHrInvites` – Stores sent invites in `localStorage` so they persist across sessions.

Components like `CandidateTable`, `AssessmentMetrics`, `InvitationCodeCard`, `InviteCandidateModal`, and `ToolkitResourcesCard` are rendered here. State for sending invites and generating codes is maintained locally with React `useState` and is not stored in context.

## User Profile Page

**File:** `src/app/hr-admin/dashboard/[userId]/page.tsx`

This page displays a candidate's restorative record. It fetches data directly from Supabase using the `supabase` client. The page uses React hooks (`useState`, `useEffect`) and `useRouter` for navigation. There are no custom context providers involved here. All fetched data (profile details and restorative record sections) is stored in component state and presented through the tab components found in `[userId]/tabs/`.

## Assessment Page

**File:** `src/app/hr-admin/dashboard/[userId]/assessment/page.tsx`

The assessment page orchestrates the multi‑step criminal history assessment. It wraps its content in `AssessmentProvider`, which in turn sets up the following contexts:

- **`useAssessmentSteps`** – remembers the current step, answers, and any notes. This state is persisted in `localStorage` so the HR admin can resume later.
- **`AssessmentStorageProvider`** – provides storage hooks (`useStep1Storage`, `useStep2Storage`, etc.) for each form used in the workflow. Forms such as the offer letter or revocation notice automatically save to `localStorage`.
- **`useCandidateData`** – stores candidate profile information, share token, and timeline data that is displayed in the assessment timeline.
- **`useDocumentUploads`** – tracks uploaded files and viewer settings for the document panel.

Within the page, several hooks from `src/hooks` are utilized:

- `useAssessmentStorage` – merges `useAssessmentSteps` with the form storage hooks so the component can read and update saved documents.
- `useHRAdminProfile` – loads the HR admin profile to personalize documents.
- `useCandidateDataFetchers` – helper functions to fetch the candidate's share token and timeline data from Supabase.
- `useDocumentHandlers` – handles viewing and downloading of uploaded documents.

The assessment steps themselves are implemented in separate components (`Step1` through `Step6`). Those step components use storage hooks (`useStep1Storage`, `useStep2Storage`, etc.) and action hooks (`useStep1Actions`, `useStep2Actions`, ... `useStep5Actions`) to handle form submission and email sending. All of this state is maintained by the contexts established above.

The page also initializes optional assessment tracking using the `safeAssessmentTracking` service. If tracking is available, session IDs and audit logs are stored, but if it fails the UI continues to function with only `localStorage` persistence.

## Summary

- **Contexts** provide persistent state for assessment progress, saved forms, candidate data and document uploads.
- **Hooks** supply data fetching (`useHRAdminProfile`, `usePermittedUsers`, `useCandidateDataFetchers`), invite management (`useHrInvites`), document handling, and per‑step actions.
- The HR Admin Dashboard page mainly lists users and sends invites, the User Profile page presents restorative record data, and the Assessment page orchestrates the multi-step compliance workflow while leveraging multiple contexts and hooks.

