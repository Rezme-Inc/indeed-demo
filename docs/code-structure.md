# Code Structure Documentation

## Main Folders

- `src/` - Main source code directory
  - `app/` - Next.js app directory (routing, pages, layouts)
    - `page.tsx` - Landing page with role selection and login buttons
    - `auth/signup/page.tsx` - Signup form for all roles
    - `[role]/dashboard/` - Dashboards for each user type
      - `layout.tsx` - Shared dashboard layout
      - `page.tsx` - Dashboard page for each role (user, hr_admin, rezme_admin)
    - `restorative-record/` - Restorative Record Builder (modular structure)
      - `page.tsx` - Main component (16KB, 602 lines - reduced from 86KB, 2349 lines)
      - `sections/` - Individual section components
        - `IntroductionSection.tsx` - Social links and narrative
        - `PersonalAchievementsSection.tsx` - Awards and recognition
        - `SkillsSection.tsx` - Soft and hard skills
        - `CommunityEngagementSection.tsx` - Volunteer work
        - `RehabilitativeProgramsSection.tsx` - Program participation
        - `MicrocredentialsSection.tsx` - Certifications
        - `MentorsSection.tsx` - Mentor recommendations
        - `EducationSection.tsx` - Educational background
        - `EmploymentHistorySection.tsx` - Work experience
        - `HobbiesSection.tsx` - Interests and activities
        - `index.ts` - Barrel export for clean imports
      - `components/` - Reusable UI components
        - `DatePicker.tsx` - Date selection component
        - `FileUpload.tsx` - File upload with drag-and-drop
        - `FormDialog.tsx` - Modal form wrapper
        - `RecordItem.tsx` - Display component for records
      - `hooks/` - Custom React hooks
        - `useFormCRUD.ts` - Reusable CRUD operations for forms
      - `utils/` - Utility functions and helpers
        - `saveToSupabase.ts` - Centralized save logic (522 lines)
      - `types.ts` - TypeScript interfaces and types
      - `constants.ts` - Application constants and options
      - `utils.ts` - File handling and date utilities
      - `profile/` - User's restorative record display
    - `globals.css` - Global styles, includes Tailwind CSS
  - `lib/` - Shared libraries
    - `supabase.ts` - Supabase client configuration
  - `components/ui/` - Shared UI components
    - `use-toast.tsx` - Toast notification hook
  - `types/` - TypeScript type definitions
    - `auth.ts` - User, HR Admin, and Rezme Admin profile types

## Key Files

- `package.json` - Project dependencies and scripts
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.env.local` - Environment variables (Supabase credentials)
- `next.config.js` - Next.js configuration

## Main Components

- **Landing Page** (`src/app/page.tsx`):
  - Lets users choose their role (User, HR Admin, Rezme Admin)
  - Includes login buttons for each role
- **Signup Page** (`src/app/auth/signup/page.tsx`):
  - Handles registration for all roles, stores profile data in Supabase
- **Dashboard Layout** (`src/app/[role]/dashboard/layout.tsx`):
  - Shared navigation and layout for all dashboards
- **User Dashboard** (`src/app/user/dashboard/page.tsx`):
  - Displays user profile info
- **HR Admin Dashboard** (`src/app/hr_admin/dashboard/page.tsx`):
  - Shows connected users and visible users
- **Rezme Admin Dashboard** (`src/app/rezme_admin/dashboard/page.tsx`):
  - Lists all users and HR admins

## Restorative Record Architecture

The Restorative Record Builder follows a modular, component-based architecture:

### Component Hierarchy

```
page.tsx (Main Controller)
├── sections/ (Feature Components)
│   ├── IntroductionSection
│   ├── PersonalAchievementsSection
│   ├── SkillsSection
│   ├── CommunityEngagementSection
│   ├── RehabilitativeProgramsSection
│   ├── MicrocredentialsSection
│   ├── MentorsSection
│   ├── EducationSection
│   ├── EmploymentHistorySection
│   └── HobbiesSection
├── components/ (Reusable UI)
│   ├── DatePicker
│   ├── FileUpload
│   ├── FormDialog
│   └── RecordItem
├── hooks/ (Business Logic)
│   └── useFormCRUD
└── utils/ (Helpers)
    └── saveToSupabase
```

### Key Design Patterns

1. **Separation of Concerns**: Each section is a self-contained component with its own UI and logic
2. **Custom Hooks**: `useFormCRUD` provides reusable CRUD operations for all form sections
3. **Centralized Data Persistence**: All save operations are handled by `saveToSupabase`
4. **Type Safety**: Strong TypeScript typing throughout with interfaces for all data structures
5. **Modular Imports**: Barrel exports in `sections/index.ts` for clean imports

### Benefits of the Refactored Structure

- **Maintainability**: Each section can be modified independently
- **Readability**: Main page reduced by 74% (from 2349 to 602 lines)
- **Reusability**: Components and hooks can be reused across the application
- **Testing**: Individual components are easier to unit test
- **Performance**: Potential for code splitting and lazy loading

## Data Flow

- Authentication and profile data are managed via Supabase.
- Each role has its own dashboard and profile data table in Supabase.
- Restorative Record data is stored across multiple Supabase tables (awards, education, skills, etc.)
- File uploads are handled through Supabase Storage with proper bucket organization

---

For more details, see the code comments in each file.
