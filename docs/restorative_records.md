# Restorative Records System Documentation

## Overview

The Restorative Records system is a comprehensive platform that allows justice-impacted individuals to create and maintain a detailed record of their personal journey, achievements, and growth. This document outlines the system architecture, features, database structure, and implementation details.

## System Architecture

The Restorative Records Builder is organized into a modular, component-based architecture:

```
restorative-record/
├── page.tsx                    # Main controller (602 lines)
├── sections/                   # Feature components
│   ├── IntroductionSection     # Social links & narrative
│   ├── PersonalAchievements    # Awards & recognition
│   ├── SkillsSection          # Soft & hard skills
│   ├── CommunityEngagement    # Volunteer work
│   ├── RehabilitativePrograms # Program participation
│   ├── Microcredentials       # Certifications
│   ├── MentorsSection         # Recommendations
│   ├── EducationSection       # Educational background
│   ├── EmploymentHistory      # Work experience
│   └── HobbiesSection         # Interests & activities
├── components/                 # Reusable UI components
├── hooks/                      # Custom React hooks
├── utils/                      # Utility functions
├── types.ts                    # TypeScript interfaces
└── constants.ts               # Application constants
```

## Features

### 1. Multi-Section Record Building

- **10 comprehensive sections** covering all aspects of a person's journey
- **Step-by-step navigation** with sidebar for easy access
- **Auto-save functionality** when navigating between sections
- **Progress tracking** through visual indicators

### 2. Rich Data Input

- **Multiple input types**: text, select, date picker, file upload
- **Character limits** with real-time counters
- **Conditional fields** that appear based on selections
- **Narrative fields** for personal storytelling

### 3. File Management

- **Drag-and-drop file upload** for certificates and documents
- **File size validation** (2MB for awards, 5MB for others)
- **Secure storage** in Supabase Storage buckets
- **File preview** functionality

### 4. CRUD Operations

- **Add multiple entries** per section (awards, skills, etc.)
- **Edit existing entries** with pre-filled forms
- **Delete entries** with confirmation
- **Reusable CRUD hook** (`useFormCRUD`) for consistency

## Database Structure

### Core Tables

1. **introduction** - Personal information and social links

```sql
CREATE TABLE introduction (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    facebook_url TEXT,
    linkedin_url TEXT,
    reddit_url TEXT,
    digital_portfolio_url TEXT,
    instagram_url TEXT,
    github_url TEXT,
    tiktok_url TEXT,
    pinterest_url TEXT,
    twitter_url TEXT,
    personal_website_url TEXT,
    handshake_url TEXT,
    preferred_occupation TEXT,
    personal_narrative TEXT,
    language_proficiency TEXT,
    other_languages TEXT[]
);
```

2. **awards** - Personal achievements

```sql
CREATE TABLE awards (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    type TEXT,
    name TEXT,
    organization TEXT,
    date DATE,
    narrative TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER
);
```

3. **skills** - Soft and hard skills

```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    soft_skills TEXT[],
    hard_skills TEXT[],
    other_skills TEXT,
    narrative TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER
);
```

4. **education** - Educational background

```sql
CREATE TABLE education (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    school_name TEXT,
    school_location TEXT,
    degree TEXT,
    field_of_study TEXT,
    currently_enrolled BOOLEAN,
    start_date DATE,
    end_date DATE,
    grade TEXT,
    description TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER
);
```

5. **employment** - Work history

```sql
CREATE TABLE employment (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    state TEXT,
    city TEXT,
    employment_type TEXT,
    title TEXT,
    company TEXT,
    company_url TEXT,
    start_date DATE,
    end_date DATE,
    currently_employed BOOLEAN,
    incarcerated BOOLEAN
);
```

6. **community_engagements** - Volunteer work
7. **rehabilitative_programs** - Program participation
8. **micro_credentials** - Certifications
9. **mentors** - Mentor information
10. **hobbies** - Interests and activities

## Security Measures

### Row Level Security (RLS)

All tables implement RLS policies ensuring users can only:

- View their own records
- Insert their own records
- Update their own records
- Delete their own records

### File Upload Security

- File type validation
- Size limits enforced
- Secure bucket storage
- Public URL generation for authorized access

## Key Components

### 1. useFormCRUD Hook

Provides reusable CRUD operations:

```typescript
const hook = useFormCRUD({
  initialFormState: {...},
  validateForm: (form) => boolean
});
```

### 2. saveToSupabase Utility

Centralized save logic that:

- Handles all section saves
- Manages file uploads
- Provides error handling
- Shows toast notifications

### 3. Section Components

Each section is self-contained with:

- Form management
- Validation logic
- Display components
- File handling

## Best Practices

1. **Modular Design**: Each section is independent and maintainable
2. **Type Safety**: Strong TypeScript typing throughout
3. **Error Handling**: Comprehensive error messages and recovery
4. **User Experience**: Auto-save, progress indicators, validation feedback
5. **Performance**: Optimized file uploads, efficient state management
6. **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

## Usage Flow

1. User navigates to `/restorative-record`
2. Starts with Introduction section
3. Fills out forms and uploads files
4. Navigates between sections (auto-saves)
5. Reviews completed record at `/restorative-record/profile`
6. Can return to edit anytime

## Technical Benefits

- **74% code reduction** in main file (2349 → 602 lines)
- **Improved maintainability** through modular structure
- **Better testability** with isolated components
- **Enhanced reusability** of components and hooks
- **Scalability** for adding new sections

## Support

For questions about restorative records:

1. Review component documentation
2. Check TypeScript interfaces for data structures
3. Consult the constants file for available options
4. Follow established patterns when adding features
