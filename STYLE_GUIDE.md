# Frontend Style Guide

This document outlines the standard styling and layout conventions for the Grades Frontend project, based on the reference implementation in **Student Grade Entry** (`src/views/teacher/GradeStudents.vue`).

## 1. Page Layout

### Container
All page views should be wrapped in a root container `div` with a consistent padding.

```html
<template>
  <div class="page-container">
    <!-- Content -->
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
```

### Main Content Card
The primary content of the page should be enclosed in an `el-card`. The first card on the page should **not** have a top margin.

```html
<el-card>
  <template #header>
    <!-- Header Content -->
  </template>
  <!-- Body Content -->
</el-card>
```

Secondary cards (if any) should have a top margin of `20px`.

## 2. Header Styling

The card header serves as the main navigation and action area. It should use a flexbox layout.

### Structure
```html
<template #header>
  <div class="card-header">
    <div class="header-left">
      <!-- Back Button & Title -->
    </div>
    <div class="header-right">
      <!-- Action Buttons -->
    </div>
  </div>
</template>
```

### CSS
```css
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}
```

### Back Button & Title
- **Back Button**: Use a circular `el-button` with the `ArrowLeft` icon.
- **Title**: Use a `span` with a left margin of `10px` relative to the back button. Font weight should be bold (600).

```html
<div class="header-left">
  <el-button @click="goBack" :icon="ArrowLeft" circle />
  <span style="margin-left: 10px; font-weight: 600; font-size: 16px;">
    Page Title
  </span>
</div>
```
*Note: Import `ArrowLeft` from `@element-plus/icons-vue`.*

## 3. Section Spacing

Separate distinct sections (e.g., Statistics, Filters, Tables) using `margin-bottom: 20px` or `el-row` with gutters.

```html
<!-- Statistics Section -->
<el-row :gutter="20" style="margin-bottom: 20px">
  ...
</el-row>

<!-- Filters/Actions Section -->
<el-row style="margin-bottom: 20px">
  ...
</el-row>

<!-- Table Section -->
<el-table ...>
```

## 4. UI Components

### Tables
- Use `stripe` for better readability.
- Use `v-loading` for loading states.
- align content using `align="center"` where appropriate (e.g., scores, status).

### Buttons
- **Primary Actions**: `type="primary"`
- **Success Actions** (Save/Submit): `type="success"`
- **Warning/Danger**: Use appropriately for destructive or alert actions.
- **Icons**: Use icons inside buttons for clarity (e.g., `<el-icon><Download /></el-icon>`).

### Status Tags
Use `el-tag` to display status or categories.
- **Success**: `type="success"` (e.g., "Graded", "Passed")
- **Warning**: `type="warning"` (e.g., "Pending")
- **Info**: `type="info"` (e.g., "Ungraded", Metadata)

## 5. Typography
- **Headings**: Keep font sizes consistent. Main card titles around `16px` to `18px`.
- **Labels**: Use standard Element Plus label sizes.

## 6. Icon Imports
Always import icons explicitly from `@element-plus/icons-vue`.

```javascript
import { ArrowLeft, Edit, Delete, Download } from "@element-plus/icons-vue";
```
