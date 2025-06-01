# Restorative Record Architecture

## Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        page.tsx (Main Controller)                    │
│                            602 lines                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ State Management:                                            │   │
│  │ - currentCategory (navigation)                               │   │
│  │ - formData (introduction)                                    │   │
│  │ - 10 useFormCRUD hooks (one per section)                   │   │
│  │ - rehabPrograms state                                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┬─────────────────────┐
        │                           │                     │
        ▼                           ▼                     ▼
┌───────────────┐         ┌─────────────────┐   ┌────────────────┐
│   sections/   │         │  components/    │   │     hooks/     │
│  (10 files)   │         │   (4 files)     │   │   (1 file)     │
├───────────────┤         ├─────────────────┤   ├────────────────┤
│ Introduction  │         │ DatePicker      │   │ useFormCRUD    │
│ Achievements  │         │ FileUpload      │   │                │
│ Skills        │         │ FormDialog      │   │ Provides:      │
│ Community     │         │ RecordItem      │   │ - items[]      │
│ Rehab         │         └─────────────────┘   │ - showForm     │
│ Microcreds    │                               │ - form state   │
│ Mentors       │                               │ - CRUD ops     │
│ Education     │                               └────────────────┘
│ Employment    │
│ Hobbies       │
└───────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    utils/saveToSupabase.ts                       │
│                         522 lines                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Handles:                                                 │   │
│  │ - All database saves to Supabase                       │   │
│  │ - File uploads to Storage buckets                      │   │
│  │ - Error handling and toast notifications               │   │
│  │ - Data transformation and validation                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input → Section Component → useFormCRUD Hook → Local State
                                                          │
                                                          ▼
                                              Navigation/Submit
                                                          │
                                                          ▼
                                              saveToSupabase()
                                                          │
                    ┌─────────────────────────────────────┴───────┐
                    ▼                                             ▼
            Supabase Database                            Supabase Storage
            (Structured Data)                            (File Uploads)
```

## File Structure Benefits

### Before Refactoring

```
page.tsx (2,349 lines) 😱
└── Everything mixed together
    ├── All UI components
    ├── All state management
    ├── All save logic
    ├── All file handling
    └── All validation
```

### After Refactoring

```
page.tsx (602 lines) ✨
├── sections/ (Each ~150-200 lines)
│   └── Self-contained feature modules
├── components/ (Each ~50-100 lines)
│   └── Reusable UI components
├── hooks/ (85 lines)
│   └── Reusable business logic
└── utils/ (522 lines)
    └── Centralized operations
```

## Key Design Decisions

### 1. **Section Independence**

Each section component is completely self-contained:

- Own UI rendering
- Own form validation
- Own file handling
- Props interface for communication

### 2. **Shared Hook Pattern**

The `useFormCRUD` hook provides consistent behavior:

```typescript
const hook = useFormCRUD<DataType>({
  initialFormState: defaultValues,
  validateForm: (form) => validation logic
});
```

### 3. **Centralized Persistence**

All saves go through `saveToSupabase`:

- Single source of truth for save logic
- Consistent error handling
- Unified file upload strategy
- Transaction-like behavior

### 4. **Type Safety First**

Strong typing throughout:

- TypeScript interfaces for all data
- Type-safe props for components
- Generic hook implementation
- Proper type exports/imports

## Component Responsibilities

### Main Page (page.tsx)

- Navigation state
- Section rendering
- Hook initialization
- Save orchestration

### Section Components

- UI presentation
- Form management
- Local validation
- User interactions

### UI Components

- Reusable widgets
- Consistent styling
- Accessibility
- Event handling

### useFormCRUD Hook

- CRUD operations
- Form state
- Edit/delete logic
- Item management

### saveToSupabase Utility

- Database operations
- File uploads
- Error handling
- Success notifications

## Performance Considerations

1. **Code Splitting Potential**: Each section can be lazy-loaded
2. **Bundle Size**: Smaller chunks improve initial load
3. **Maintainability**: Isolated changes don't affect other sections
4. **Testing**: Each component can be unit tested independently
5. **Reusability**: Components and hooks can be used elsewhere

## Future Enhancements

1. **Add Loading States**: Per-section loading indicators
2. **Implement Drafts**: Save incomplete sections
3. **Add Validation Summary**: Show all errors before submit
4. **Enable Bulk Operations**: Delete multiple items at once
5. **Add Import/Export**: Allow data backup and restore
