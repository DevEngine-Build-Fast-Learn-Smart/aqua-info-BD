# Aqua Info BD

A modular React + TypeScript frontend for the public publication and its matching editorial desk. The supplied `code.html`, `DESIGN.md`, and `screen.png` are retained as design references.

## Run locally

```sh
npm install
npm run dev
```

- Public website: **http://127.0.0.1:5173/home**
- Admin workspace: **http://127.0.0.1:5173/admin/**
- Admin sign-in: **http://127.0.0.1:5173/admin/login**
- Team access: **http://127.0.0.1:5173/admin/team** (workspace owner)
- `/` redirects to `/home`; `/admin` redirects to `/admin/`.

The application uses regular paths rather than hash URLs. These paths work on localhost and on a future domain. When deploying, configure the host to serve `index.html` for application routes (an SPA history fallback). No domain or hosting is configured in this phase.

## Project structure

```text
src/
  app/                    Route definitions, shared state, navigation behavior
  components/
    layout/               Public and admin shells, shared brand
    ui/                   Accessible dialogs, reveal animations, splash, empty states
  features/
    public/               Home sections, archives, article reader, search, worksheets
    admin/                Overview, story editor, homepage and content management
  data/                   Typed entities, demo fixtures, browser storage adapter
  lib/                    Localization, dates, URL slugs, downloads
  styles/                 Design tokens, shared styles, public and admin styling
public/assets/            Local logo, photos, and typefaces
tests/                    Browser workflow and responsive checks
```

## What is implemented

The public homepage preserves the supplied navy/teal editorial direction and section sequence: lead story and field dossier, latest news, visual reports, knowledge tools, blue economy, and the Friday Dispatch. Separate routes cover categories, archives, article reading, saved stories, search, videos, resources, market prices, and publication information.

The admin follows the same sequence. It includes article creation, editing, deletion, drafts and local publishing; English/Bangla content editing; homepage section ordering and visibility; lead-story selection; video/resource collection management; sample price editing; category management; and publication settings.

The responsive publication now uses a wider canvas, larger type, asymmetric video and knowledge spreads, a new masthead/footer, and a paper-index admin sidebar. Cards reveal on scroll, supported by a reading-progress line and reduced-motion alternatives.

English uses locally hosted Public Sans and Source Serif 4. Bengali uses locally hosted Kalpurush, including inside the story editor. Animations respect `prefers-reduced-motion`. The short branded splash appears once per browser tab session. Dialogs support keyboard focus trapping, Escape, and focus restoration.

## Local admin access

The admin now opens with a dedicated login screen. Use the **Fill demo details** button or sign in with:

- Email: `admin@aquainfobd.com`
- Demo password: `AquaDemo@2026`

From **Team & access**, the owner can create local accounts, choose Editor / Contributor / Viewer presets, customize module permissions, change demo passwords, and revoke or restore access. An account creation dialog provides copyable demo sign-in details. Sign out and use the new account in the same browser to review its access. Account credentials use salted digests in local storage; the current sign-in session lives in session storage.

This is a **frontend simulation**, not production authentication. Accounts and content are local to the browser, invitations are not emailed, and permissions are not server-enforced. Use sample passwords. The owner demo credentials are intentionally public. Backend authentication is required before using this with real accounts or private information.

## UI phase and persistence

There is **no backend**. The admin login and permission screens demonstrate the intended access flow; they are not a secured administration service. Content changes are stored under `aqua-info-bd:site:v1` in this browser’s `localStorage`; public and admin views share that state, including across tabs. Saved stories and language preferences are local too. Clearing browser storage resets the demo content. A failed storage write shows a notification instead of claiming permanent success.

Prices and stories are demonstration content. Video cards open a preview, without pretending to play connected footage. Newsletter forms demonstrate validation and confirmation without sending or registering an email. The pond-volume and FCR worksheets calculate from entered measurements; the observation checklist downloads a text file.

The supplied design’s remote images returned HTTP 403, so representative locally downloaded fishing photographs are used. See [ASSETS.md](ASSETS.md). All shipped assets load locally without a font CDN or remote image dependency.

For a backend phase, retain the entity types in `src/data/types.ts`, replace the browser storage adapter/provider with API-backed queries and mutations, and connect server-enforced authentication/authorization, media hosting, email delivery, and verified editorial content.

## Validation

```sh
npm run typecheck
npm run build
npm test
npm run format:check
```

Browser tests use Playwright with installed Google Chrome (`channel: 'chrome'`). They start a temporary Vite server on port 4173 and cover local publishing, draft visibility, cross-tab changes, homepage controls, market edits, categories, resource calculations, dialogs, language persistence, and layouts at 320px, 390px, and 768px. Desktop and mobile screenshots are generated in the ignored `test-results/` directory.

```sh
npm run preview
```

Serves the production build after `npm run build`.
