# Code Structure Documentation

## Main Folders

- `src/` - Main source code directory
  - `app/` - Next.js app directory (routing, pages, layouts)
    - `page.tsx` - Landing page with role selection and login buttons
    - `auth/signup/page.tsx` - Signup form for all roles
    - `[role]/dashboard/` - Dashboards for each user type
      - `layout.tsx` - Shared dashboard layout
      - `page.tsx` - Dashboard page for each role (user, hr_admin, rezme_admin)
    - `globals.css` - Global styles, includes Tailwind CSS
  - `lib/` - Shared libraries
    - `supabase.ts` - Supabase client configuration
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

## Data Flow

- Authentication and profile data are managed via Supabase.
- Each role has its own dashboard and profile data table in Supabase.

---

For more details, see the code comments in each file.
