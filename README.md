# Aqua Info BD

React + TypeScript frontend for the client’s **aqua info website suggestion.xlsx** navigation plan. The separate Django backend powers the public pages and CMS. This revision follows the workbook’s full ten-menu plan, including Blue Economy & Climate, and retains superadmin-managed users and role access.

## Run locally

Backend location (existing folder spelling preserved):

```text
/Users/neonecy/Downloads/HAMIM WORKSPACE/aqua_info_bd_backned
```

From this frontend folder:

```sh
npm run dev:full
```

Or use separate terminals:

```sh
cd "/Users/neonecy/Downloads/HAMIM WORKSPACE/aqua_info_bd_backned"
source .venv/bin/activate
python manage.py runserver 127.0.0.1:8000
```

```sh
npm run dev
```

Website: http://127.0.0.1:5173/ · Admin: http://127.0.0.1:5173/admin/ · Swagger: http://127.0.0.1:8000/api/docs/

`/home` redirects to `/`. The Vite proxy forwards `/api/` and `/media/` to port 8000. The owner credentials stay in the backend `.env`; no credentials are compiled into the frontend. Existing accounts are retained, and the scope migration updates their permissions and requires signing in again.

## Client feature scope

| Menu                   | Public pages / content                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| Home                   | Featured Content, Latest Updates, editorial sections                                 |
| News                   | Bangladesh & Global News, Industry & Market, Policy & Research Updates               |
| Blog                   | Farming & Fish Health, Feed & Nutrition, Technology & Expert Insights                |
| Podcast                | All Episodes, Expert Interviews, Research & Industry Talks                           |
| Publications           | Research & Journal Articles, Technical Reports, E-books & Resources                  |
| Problems & Solutions   | Fish Health & Disease, Water Quality, Feed & Farm Management                         |
| Blue Economy & Climate | Blue Economy & Sustainability, Climate Change & Adaptation, Blue Carbon & Ecosystems |
| Career & Jobs          | Aquaculture & Fisheries Jobs, Internships & Training, Scholarships & Fellowships     |
| Events                 | Upcoming Events, Conferences & Webinars, Past Events & Resources                     |
| About Us               | About Aqua Info, Our Team & Contributors, Contact & Editorial Policy                 |

Each publishing section has its own list, categories, CMS editor and server-enforced access permission. The CMS supports author profiles, English/Bangla content, draft/published status, publish dates, SEO title/description, permanent slugs, cover uploads/URLs and image alt text. Homepage sections can be reordered or hidden; entries can be featured.

Podcast entries use external audio hosting or allowlisted embeds. Publications support uploaded documents, original sources, DOI and citation text. Career entries include organizations, locations, job/program types, funding/salary, deadlines and official application links. Events include Dhaka-local dates, venue, format, registration, recordings and resource files; past events are grouped automatically by date.

Public authors are separate from administrative users. The superadmin can create users and custom roles, assign section permissions, reset passwords and suspend access. The owner role cannot be granted through the team API.

The old standalone video reports, calculator/worksheet tools, live market-price widget, newsletter/subscription and saved-story interfaces have been removed. Industry/market **news** remains under News, as requested by the workbook. About and policy text is edited in the CMS; no client biographies, research, vacancies or event details are invented.

## Frontend structure

- `src/data/catalog.ts`: client navigation and public route labels.
- `src/features/public/`: shared content lists/detail views, podcast/document rendering, homepage, About pages and profiles.
- `src/features/admin/`: section editors, profiles, pages, homepage, categories, footer and branding.
- `src/features/admin/access/`: server sessions, superadmin user management and role permissions.
- `src/lib/api.ts`: CSRF-protected requests, HttpOnly-cookie session renewal and uploads.
- `src/styles/client-scope.css`: responsive navigation, content grids and CMS layouts.

Public content loads from the API with pagination, search, loading skeletons, error states and retry controls. Bangla uses Kalpurush; animations respect reduced motion. The only browser-local data retained is the language preference. No sample content is seeded.

## Configuration and hosting

Copy `.env.example` to `.env` only when overrides are needed:

```dotenv
VITE_API_BASE_URL=
VITE_BASE_PATH=/
```

Blank API base uses `/api`. For a separate backend, supply its full HTTPS API URL. Root-domain deployments need an SPA history fallback to `index.html`. The existing GitHub Pages workflow keeps the project base path; Django still needs Python-capable hosting. No deployment is performed by source changes.

Contact uses the publication email from backend settings, with submission/correction mail links and CMS-managed editorial guidance. It does not depend on an unconfigured email provider.

## API JSON downloads

Import both Postman files and select the environment, then fill in your credentials privately. Run **CSRF token → Login → Current editorial user**. Tokens are in HttpOnly response cookies (`aqua_access`, `aqua_refresh`), managed by Postman’s cookie jar.

- [Postman collection](http://127.0.0.1:8000/api/postman/collection.json)
- [Blank environment](http://127.0.0.1:8000/api/postman/environment.json)
- [OpenAPI JSON](http://127.0.0.1:8000/api/schema.json)

Re-import the updated collection for this revision; the CMS/public content now uses `/entries/` with a `section` filter. The backend includes migrations, independent content/media backup support and its own setup/deployment README.

## Website polish and account profiles

Website settings can change the English/Bangla website title across the interface and browser titles. Every content editor and About-page editor supports ordered galleries with multiple uploads or image links, captions and alt text. All account roles can update their own name/photo at `/admin/profile`; public author profiles remain separate.

The overview uses server data for live content, drafts, scheduled releases, section totals, recent updates and upcoming opportunities. Delete actions use a shared confirmation dialog and server-side deletion. Search supports a keyboard shortcut (Cmd/Ctrl + K), clearer results and empty states. Contact uses the configured publication email without a client email-service dependency.
