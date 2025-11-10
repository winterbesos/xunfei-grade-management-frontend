# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a grades management system (成绩管理系统) built with Vue 3 and Vite. The system supports three user roles: administrators, teachers, and students, with role-based access control and multiple authentication methods.

## Technology Stack

- **Framework**: Vue 3 (^3.5.22) with Composition API (`<script setup>`)
- **Build Tool**: Vite 7 (^7.1.11)
- **UI Library**: Element Plus (full-featured UI component library)
- **State Management**: Pinia (official Vue 3 state management)
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Dev Tools**: vite-plugin-vue-devtools
- **Node Version**: ^20.19.0 or >=22.12.0

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://0.0.0.0:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.js              # Application entry point with Pinia, Router, Element Plus
├── App.vue              # Root component (router-view)
├── api/                 # API service layer
│   ├── auth.js          # Authentication APIs
│   ├── admin.js         # Admin APIs
│   ├── teacher.js       # Teacher APIs
│   └── student.js       # Student APIs
├── assets/              # Static assets
├── components/
│   ├── layout/          # Layout components
│   │   └── MainLayout.vue  # Main app layout with sidebar
│   └── common/          # Reusable components
├── router/
│   └── index.js         # Route configuration with role-based guards
├── stores/              # Pinia stores
│   ├── auth.js          # Authentication state (user, token, roles)
│   └── settings.js      # System settings (login methods, OAuth config)
├── utils/
│   ├── request.js       # Axios instance with interceptors
│   └── mock.js          # Mock data and APIs for development
└── views/               # Page components
    ├── Login.vue        # Login page (password/OAuth)
    ├── NotFound.vue     # 404 page
    ├── admin/
    │   ├── SystemSettings.vue      # System configuration
    │   └── SemesterManagement.vue  # Semester CRUD
    ├── teacher/
    │   └── GradeEntry.vue          # Grade entry interface
    └── student/
        └── GradeView.vue           # Grade viewing interface
```

## User Roles & Features

### Administrator (管理员)
- **Routes**: `/admin/settings`, `/admin/semesters`
- **Features**:
  - Configure login methods (password/OAuth)
  - Manage semesters (create, edit, delete)
  - System-wide settings

### Teacher (教师)
- **Routes**: `/teacher/grades`
- **Features**:
  - Grade entry by semester and course
  - View and update student grades
  - Grade statistics

### Student (学生)
- **Routes**: `/student/grades`
- **Features**:
  - View personal grades
  - Filter by semester
  - Export grade reports (placeholder)

## Authentication

### Login Methods
The system supports two authentication methods (configurable in System Settings):
1. **Password Login**: Username/password authentication
2. **OAuth Login**: External OAuth provider (Google, GitHub, custom)

### Test Accounts (Mock Mode)
- Admin: `admin / admin123`
- Teacher: `teacher1 / teacher123`
- Student: `student1 / student123`

### Route Guards
- Authentication required for all routes except `/login`
- Role-based access control via `meta.roles` in routes
- Automatic redirect to role-appropriate homepage after login

## Mock Data vs Real API

The application uses **mock data by default** for development. Configure in `.env`:

```
VITE_USE_MOCK=true     # Use mock data
VITE_API_BASE_URL=/api # Real API base URL
```

Mock data is defined in `src/utils/mock.js` and includes:
- Sample users for all three roles
- Semesters, courses, and grades
- All API methods return promises with realistic delays

## Configuration

### Path Alias
- `@` is aliased to `./src` directory
- Example: `import { useAuthStore } from '@/stores/auth'`

### Environment Variables
Create `.env` file in project root:
```
VITE_API_BASE_URL=/api
VITE_USE_MOCK=true
```

### Vite Configuration (vite.config.js)
- Dev server listens on `0.0.0.0:5173` (external access enabled)
- Vue plugin and Vue DevTools enabled

## State Management

### Auth Store (`stores/auth.js`)
- Manages user authentication state
- Stores token and userInfo in localStorage
- Provides role checking methods

### Settings Store (`stores/settings.js`)
- System configuration (login methods, OAuth settings)
- Persisted in localStorage
- Controls which login options are displayed

## Key Development Notes

- All Vue components use `<script setup>` Composition API syntax
- Element Plus icons are globally registered in `main.js`
- API layer abstracts mock vs real API calls
- Route guards handle authentication and authorization
- Login method configuration is stored client-side (localStorage)
