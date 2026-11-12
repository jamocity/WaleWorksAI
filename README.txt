WaleWorks AI guest-workday and readability update

Extract into the project root (same directory as package.json), then run:
  powershell -ExecutionPolicy Bypass -File .\apply-guest-ux-upgrade.ps1

The patch replaces components/guest-playground.tsx, adds lib/guest-workdays.ts, and appends styles/guest-ux-accessibility.css to app/globals.css.
No database changes or dependencies are required.
See GUEST-EXPERIENCE-AND-READABILITY-INSTALL.txt for the full test checklist.
