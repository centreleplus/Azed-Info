# Implementation Plan - Student Notifications System

## Overview
Implement a robust, persistent, and isolated notification system for the student dashboard. This system will track and trigger notifications for 7 key events, synchronize via background polling (every 20s), and feature a scrollable CSS dropdown with individual deletion in the student header.

---

## Proposed Changes

### 1. Backend (`server.ts`)
- **Storage / Database Schema**:
  - Add `studentNotifications` collection/table in `db_sandbox.json` / server state supporting fields: `id`, `studentId` (or targeted student filtering), `title`, `location`, `timestamp`, `read`.
- **API Endpoints**:
  - `GET /api/student/notifications` : Fetch unread/read notifications strictly filtered for the authenticated student ID.
  - `POST /api/student/notifications` : Internal helper or endpoint to record a new notification when any of the 7 events occur.
  - `DELETE /api/student/notifications/:id` : Remove a notification individually.
- **7 Event Triggers Integration**:
  - Automatically record notifications upon:
    1. New file upload (`/api/documents` or course creation)
    2. New quiz creation (`/api/admin/quizzes` or quiz upload)
    3. New calendar task/event
    4. New store item added
    5. Item added to cart
    6. Item added to wishlist
    7. Order confirmation

### 2. Frontend Components (`src/components/`)
- **Create `StudentNotificationsDropdown.tsx`**:
  - Implement the notification bell button with unread count badge (animated pulse).
  - Implement floating dropdown panel with strict CSS constraints (`max-height: 400px; overflow-y: auto;`).
  - Implement 20-second automatic polling via `useEffect` and `setInterval`.
  - Implement individual notification dismissal/deletion (`handleRemoveNotification`).
- **Integrate into Student Header / Sidebar** (`App.tsx` or Student Navbar / Header):
  - Place `StudentNotificationsDropdown` prominently in the student header next to profile/logout.

---

## Verification Plan
1. **Build & Compile**:
   - Run `compile_applet` and `lint_applet` to ensure no TypeScript or bundling errors.
2. **Functional Verification**:
   - Trigger the 7 event types (file upload, quiz creation, store item, cart addition, wishlist, calendar event, order confirmation) and verify they appear in the student's notification dropdown via polling.
   - Verify scrollable behavior and individual item deletion.
   - Verify total role isolation (admin events do not leak or cross-contaminate other spaces).
