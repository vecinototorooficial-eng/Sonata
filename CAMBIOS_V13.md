# Sonata MVP V13 — English / Español

- Default language is English, independently of the device language.
- Visible language toggle in the top bar: Español / English.
- Language is saved to localStorage (`sonata_ui_language`) and restored at startup.
- Localized interface copy covers lessons, practice, shop, badges, chests, missions, profile and premium UI.
- Game progress continues to use the same `sonata_mvp_v1` storage key and is not reset when switching language.
- Musical pitch symbols C D E F G A B remain consistent across languages; solfège names remain in the learning material.
- `i18n.js` added to cache; cache version updated to v13. No payment flow was changed.
- A few interpolated messages or accessibility descriptions might require additional copy-editing after real-device testing.

To publish, update `index.html`, `styles.css`, `manifest.webmanifest`, `service-worker.js` and add `i18n.js`. `app.js` remains unchanged.
