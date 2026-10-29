# Aqua Info BD

React + TypeScript publication and editorial workspace, connected to a separate Django REST backend. The original design references (`code.html`, `DESIGN.md`, `screen.png`) are retained. Published content is read from the backend; there is no local demo-content fallback.

## Start locally

The backend is in the existing folder:

```text
/Users/neonecy/Downloads/HAMIM WORKSPACE/aqua_info_bd_backned
```

The folder’s existing spelling is preserved. Its `.env` contains the initial superadmin credentials from the approved project brief. Credentials are not included in this repository or compiled frontend.

After backend setup, start both processes from this frontend folder:

```sh
npm install
npm run dev:full
```

Stop any previous frontend/backend server first if it already owns ports 5173/8000. `dev:full` starts Django without its reloader and Vite with frontend hot reload; restart the command after changing backend Python files. Use `AQUA_BACKEND_PATH` to point the launcher at a different backend checkout.

Or start them separately:

```sh
# Backend terminal
cd "/Users/neonecy/Downloads/HAMIM WORKSPACE/aqua_info_bd_backned"
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8000
```

```sh
# Frontend terminal, in this project
npm run dev
```

- Public website: **http://127.0.0.1:5173/home**
- Editorial login: **http://127.0.0.1:5173/admin/login**
- Admin workspace: **http://127.0.0.1:5173/admin/**
- Swagger: **http://127.0.0.1:8000/api/docs/**

The Vite development proxy forwards `/api/` and `/media/` to Django. SQLite keeps local setup small; the backend also supports PostgreSQL through `DATABASE_URL`. See the backend’s README for setup, backup, media serving, deployment, and authentication details.

## Implemented publishing scope

- English/Bangla articles, drafts, publishing, categories, full-story reading, server-side search and paginated archives.
- Real image/video/document uploads or media URLs. Videos play uploaded sources or supported YouTube/Vimeo embeds.
- Published guides with document links or actual guide text. Pond-volume and FCR worksheets remain lightweight frontend calculations when those resource types are published.
- Homepage lead selection, ordered sections and visibility, logo/branding settings, and bilingual footer editing.
- Server-backed admin login and logout, automatic refresh through HttpOnly cookies, CSRF protection, account revocation, module permissions, and owner-managed custom roles.
- Skeleton loading, retry/error states and server-confirmed saving. Public APIs never return drafts. Public readers do not need accounts.
- Language preference and saved article IDs remain browser-local; bookmarks load the corresponding published stories from the API.

The initial publication has its real structural categories and branding but **no sample stories, videos, resources, or prices**. Empty sections show honest empty states until the editorial team publishes content. Previous browser-local demo content/accounts are not imported into the server.

## Deferred features

Live market data and Friday Dispatch subscriptions display **“Under development, coming soon.”** The interface does not accept subscription emails or show fabricated market prices. Newsletter sending, invitation emails, video transcoding and public reader accounts are not part of this release.

## Contact / EmailJS

`/contact` contains the contact workflow. Fill these frontend variables to enable EmailJS:

```dotenv
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

The EmailJS template should accept `from_name`, `from_email`, `reply_to`, and `message`. Configure the intended recipient and allowed website origins in EmailJS. These are public frontend integration IDs; do not put private provider credentials in Vite variables. Without them, the page shows the publication’s direct email address instead of pretending to send messages. No EmailJS account or keys were supplied with the brief, so sending is not configured yet.

## Frontend configuration

Copy `.env.example` to `.env` when you need overrides:

- `VITE_API_BASE_URL`: blank uses the same-origin `/api` route. Set the full HTTPS API URL for a separately hosted backend.
- `VITE_BASE_PATH`: `/` for a purchased domain. `/aqua-info-BD/` preserves the current GitHub Pages project path.

The existing GitHub Pages workflow sets its project base path and reads API/EmailJS IDs from repository **variables**. No deployment has been triggered by this implementation. A statically hosted frontend still needs a running, reachable Django backend; it will show a connection error if no API is configured.

For a root-domain deployment, serve `index.html` as the SPA history fallback. Prefer a same-origin or same-site API so authentication does not depend on third-party cookies. The backend README includes a starting Nginx configuration.

## Source structure

```text
src/
  app/                    App routes and API-backed publication context
  components/layout/      Public/admin shells, brand, header and footer
  components/ui/          Media input, loading/error states, dialogs and animations
  data/                   Types, structural defaults, resource mutation adapter
  features/public/        Public reading, videos, guides, search, contact
  features/admin/         Content/configuration editors and team access
  lib/                    API client, renewable sessions, query hooks, utilities
  styles/                 Responsive publication, admin and integration styling
```

English uses local Public Sans / Source Serif 4; Bangla uses local Kalpurush. Animations respect reduced-motion preferences. See [ASSETS.md](ASSETS.md) for the supplied branding and retained design photography.

## Checks and API handoff

```sh
npm run typecheck
npm run build
npm run format:check
```

The backend includes focused permission/authentication/upload checks, migrations, an OpenAPI export, and:

```text
docs/Aqua Info BD.postman_collection.json
docs/Aqua Info BD.local.postman_environment.json
```

Import both files into Postman, enter credentials privately, run CSRF first and then Login. Neither file contains passwords or session tokens. The backend README documents all API routes, supported filters, and configuration fields.

You can also download them from the Swagger page, or directly while Django is running:

- [Postman collection JSON](http://127.0.0.1:8000/api/postman/collection.json)
- [Postman environment JSON](http://127.0.0.1:8000/api/postman/environment.json)
- [OpenAPI JSON](http://127.0.0.1:8000/api/schema.json)

Login and refresh return user details in JSON; the JWTs are sent in HttpOnly cookies named `aqua_access` and `aqua_refresh`. Inspect the response cookies in Postman and leave its cookie jar enabled. No manual Bearer token is needed for the collection. The collection includes CRUD, settings, team, roles and upload templates; run individual requests after editing their values and choosing files.
