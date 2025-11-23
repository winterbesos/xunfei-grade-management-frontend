# grades-frontend Project Overview

This project is the frontend for a grades management application, built with Vue.js using Vite as the build tool and Element Plus for the UI framework. It provides different interfaces and functionalities based on user roles (admin, teacher, student, maintenance staff).

## Technologies Used

*   **Framework:** Vue.js (v3)
*   **Build Tool:** Vite
*   **UI Library:** Element Plus
*   **Routing:** Vue Router
*   **State Management:** Pinia (inferred from `stores` directory)
*   **Charting:** ECharts (used in `Report.vue`)

## Project Structure Highlights

*   `src/`: Contains the main source code.
    *   `api/`: API service modules for interacting with the backend.
    *   `assets/`: Static assets like CSS and images.
    *   `components/`: Reusable Vue components.
        *   `components/layout/MainLayout.vue`: The main application layout, including the navigation menu and header.
    *   `router/`: Vue Router configuration.
    *   `stores/`: Pinia stores for state management (e.g., authentication, settings).
    *   `utils/`: Utility functions (e.g., `https.js`, `request.js`, `reportDataMapper.js`).
    *   `views/`: Vue components for different pages/views.
        *   `views/common/Report.vue`: Component for displaying student grade reports, including print functionality.
        *   `views/common/print.css`: CSS file containing print-specific styles to control layout and hide non-essential elements during printing.
*   `public/`: Public static assets.
*   `ssl/`: SSL certificates and generation script.
*   `package.json`: Project metadata, dependencies, and scripts.
*   `vite.config.js`: Vite configuration file.

## Building and Running

### Setup

To install the project dependencies:

```bash
npm install
```

### Development Server

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

### Production Build

To compile and minify the application for production deployment:

```bash
npm run build
```

## Print Functionality (`Report.vue`)

The `Report.vue` component includes a print function (`handlePrint`) that triggers the browser's native print dialog. It utilizes `@media print` CSS rules, defined within `Report.vue`'s `<style>` block and imported `src/views/common/print.css`, to control the appearance of the printed output.

Specifically, during printing:
*   The action bar and other non-content elements are hidden using `display: none !important;` and `visibility: hidden !important;` rules, targeting classes like `.no-print`, `.action-bar`, `.el-header`, `.el-aside`, and `.el-container`.
*   The report content is formatted to fit an A4 page size.
*   Table headers are configured to repeat on each page for multi-page reports.

This setup ensures that only the report content is visible and properly formatted when printed, while extraneous UI elements are hidden.