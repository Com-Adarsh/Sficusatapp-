# Frontend completion snapshot

The SFI CUSAT Digital Student Platform frontend is being completed independently of the database backend.

## Current frontend scope

- Responsive global navigation and footer
- Mobile-first home/dashboard experience
- Abhimanyu Learning Space
- Resource browsing and filtering UI
- Opportunities hub and browse UI
- Aashraya landing, blood request, donor registration and camp UI
- Sahayi landing and existing scribe workflows
- Samskara landing, events, competitions, registration, magazine, gallery and volunteer UI
- Student Support and Helpdesk
- Updates feed empty state
- Global search
- Student profile
- Operations/admin workspace
- Authentication screens retained as the future backend integration surface

## Data policy

The frontend deliberately uses demo records, empty states and explicit demo labels where live data is unavailable. No fabricated student records, impact counts, announcements, opportunities or medical data are presented as real.

## Backend status

Supabase/database work is paused. MongoDB Atlas is the intended backend direction, but the frontend does not depend on MongoDB yet.

When backend work resumes, replace demo state with MongoDB-backed services, authentication, role checks, file storage, notifications and audit logging without changing the overall information architecture.

## Ownership

Run by SFI CUSAT. Not an official website of Cochin University of Science and Technology.
