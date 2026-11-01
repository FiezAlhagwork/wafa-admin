# Wafa — Website + Admin Dashboard (wafa-admin)

One Next.js project with two completely separate parts for the "Wafa" (وفاء) loyalty-card platform:

1. **Website** (`/`, `/en`): the public marketing site. Merchants learn about the platform and download the apps. Arabic + English, Server Components, SEO. **No API calls, no sign-in.**
2. **Admin dashboard** (`/admin`): the internal dashboard used only by the platform team (4 roles), not by merchants or customers. Arabic only, client-side behind Clerk.

The two parts share only the design tokens (`styles/globals.css`), the font and `components/ui`. Nothing in the website imports from `features/`, `lib/api/` or `lib/auth/`, and nothing in the dashboard imports from `site/`.

The single source of truth for the API is the Notion page "Wafaa API — دليل الفرونت" (§5 Admin Dashboard) and `openapi.yaml` in the backend repo. If this file conflicts with the guide, the guide wins — and flag the conflict.

---

## Tech stack

| Area | Library | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict | Website: Server Components. Dashboard: client-side, no Server Actions, no server-side data fetching |
| Memoization | React Compiler (enabled) | Memoizes automatically at build time. No manual `useMemo` / `useCallback` / `memo` |
| Website i18n | `next-intl` | `ar` (default, no prefix) and `en` (`/en`). Website only |
| Auth | `@clerk/nextjs` | `proxy.ts` (not `middleware.ts` in Next 16) protects `/admin` only; the website is public |
| Requests | axios (single instance) + `openapi-typescript` | Types generated from `openapi.yaml`, hooks written by hand |
| Server state | TanStack Query | `useQuery` / `useMutation` / `useInfiniteQuery` |
| Styling | Tailwind CSS v4 | Tokens in `@theme` inside `globals.css`, no `tailwind.config` |
| Complex behavior | Base UI (`@base-ui/react`) | Only inside `components/ui`; all styling is ours |
| Forms | react-hook-form + zod | |
| Charts | Recharts | Financial report only |
| Icons | `@phosphor-icons/react` | Same library as the loyalty-card icons |
| Font | Thmanyah (ثمانية) | `next/font/local` |
| Class merging | `clsx` + `tailwind-merge` | `cn()` helper in `lib/cn.ts`; every component uses it to merge `className` |

**Language:**
- **Website:** Arabic and English. Text lives in `messages/ar.json` and `messages/en.json`, never hardcoded. `dir` follows the locale (`rtl` for `ar`, `ltr` for `en`).
- **Dashboard:** Arabic only. `<html lang="ar" dir="rtl">`. No i18n. All user-facing text is in Arabic, written directly in the code.

---

## Commands

```bash
npm run dev          # local dev
npm run build        # standalone build
npm run lint
npm run typecheck    # tsc --noEmit
npm run gen:api      # generate src/lib/api/schema.d.ts from the backend's openapi.yaml
```

The backend runs locally on Docker: `http://127.0.0.1:8000`. After every `openapi.yaml` update, run `gen:api` and fix any type errors.

---

## Folder structure

There is **no `app/layout.tsx`**. Each part has its own root layout (Next.js multiple root layouts), so each sets its own `<html lang dir>` and loads only what it needs.

```
messages/                        # Website text only
├── ar.json
└── en.json

src/
├── app/                         # Routes only; each file points to a feature or site section
│   ├── (site)/                  # Website — public, Server Components
│   │   └── [locale]/
│   │       ├── layout.tsx       # Root layout: <html lang={locale} dir>, font, NextIntlClientProvider, site header/footer
│   │       ├── page.tsx         # Home  →  / and /en
│   │       ├── privacy/
│   │       └── ...
│   │
│   └── (admin)/                 # Dashboard — client-side behind Clerk
│       ├── layout.tsx           # Root layout: <html lang="ar" dir="rtl">, font, ClerkProvider, QueryProvider
│       ├── sign-in/
│       │   ├── page.tsx         # → /sign-in (custom UI: features/auth/screens/SignInScreen)
│       │   └── sso-callback/page.tsx   # Google returns here (AuthenticateWithRedirectCallback)
│       └── admin/
│           ├── layout.tsx       # AdminProvider (me + permissions) + Shell (sidebar + header)
│           ├── page.tsx         # Home → features/overview   →  /admin
│           ├── payments/
│           ├── merchants/
│           ├── customers/
│           ├── packages/
│           ├── settings/
│           ├── lookups/
│           ├── deletion-requests/
│           ├── finance/
│           ├── audit-logs/
│           └── admin-users/
│
├── i18n/                        # next-intl config (website only)
│   ├── routing.ts               # locales: ['ar', 'en'], defaultLocale: 'ar', localePrefix: 'as-needed'
│   ├── request.ts
│   └── navigation.ts            # Link, redirect, usePathname aware of the locale
│
├── site/                        # Website sections and components (Hero, Features, Download...)
│
├── features/                    # One folder per feature: its screens, components and requests
│   └── merchants/
│       ├── screens/             # MerchantsListScreen.tsx, MerchantDetailScreen.tsx
│       ├── components/          # MerchantStatusBadge.tsx, SuspendDialog.tsx
│       ├── services.ts          # Typed functions calling the API (layer 3)
│       ├── hooks.ts             # useMerchants, useSuspendMerchant (layer 4)
│       ├── schemas.ts           # zod form schemas
│       └── keys.ts              # query keys
│
├── components/
│   ├── ui/                      # Design system: all generic components
│   └── layout/                  # Shell, Sidebar, PageHeader
│
├── lib/
│   ├── api/
│   │   ├── client.ts            # The only axios instance + interceptors (layer 2)
│   │   ├── errors.ts            # ApiError + getErrorMessage + applyFieldErrors (layer 1)
│   │   ├── error-messages.ts    # Arabic text for every error.code
│   │   ├── schema.d.ts          # Generated — never edit by hand
│   │   └── types.ts             # Convenience aliases from schema.d.ts
│   ├── auth/
│   │   ├── admin-provider.tsx   # Reads /admin/auth/me and provides permissions
│   │   └── can.tsx              # <Can permission="..."> + usePermission()
│   ├── cn.ts                    # cn() = twMerge(clsx(...))
│   ├── format.ts                # Dates, amounts, phone numbers
│   └── query-client.ts
│
├── config/
│   └── navigation.ts            # Sidebar items, each with its permission
│
├── styles/globals.css           # @theme: colors, font, spacing
└── proxy.ts                     # clerkMiddleware wrapping next-intl: Clerk protects /admin, next-intl handles website routes only
```

---

## The five layers (mandatory in every feature)

1. **Shared error handler** (`lib/api/errors.ts`): converts an axios error into `ApiError { status, code, details }`.
2. **Single axios instance** (`lib/api/client.ts`): `baseURL = NEXT_PUBLIC_API_URL + '/api/v1'`, `Accept: application/json`, and the Clerk token attached before every request.
3. **Service** (`features/*/services.ts`): pure typed functions that return `data`. No React, no Query.
4. **Hook** (`features/*/hooks.ts`): wraps the service in `useQuery` / `useMutation` / `useInfiniteQuery`, and owns invalidation.
5. **Usage**: components **always** call the hook — never the service or the API directly.

### Token without an instance per render

The backend guide has a `useAdminApi()` that creates a new axios instance on every render. **We don't use it.** Instead:

```ts
// lib/api/client.ts
let tokenGetter: (() => Promise<string | null>) | null = null;
export const setTokenGetter = (fn: typeof tokenGetter) => { tokenGetter = fn; };

export const api = axios.create({ baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`, headers: { Accept: 'application/json' } });

api.interceptors.request.use(async (config) => {
  const token = await tokenGetter?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

`AdminProvider` calls `setTokenGetter(getToken)` from `useAuth()` once.

---

## Auth and permissions

- **Sign-in is our own UI** (no Clerk `<SignIn />`): Google (`signIn.sso`) and email + one-time code (`signIn.emailCode`), built on Clerk 7's `useSignIn()` with our components. Clerk error messages are English and never shown: Arabic text by Clerk error code lives in `features/auth/clerk-errors.ts`.
- **Clerk:** `proxy.ts` protects `/admin(.*)` only. `/sign-in` and the whole website are public. The next-intl middleware must never run on `/admin`, `/sign-in` or `/api`. The secret key `sk_…` **never reaches the frontend**. Email is never sent in a request body; the server reads it from the token.
- **`GET /admin/auth/me`** is the first request. It returns `role` and `permissions`. If it returns `403 FORBIDDEN`, the user is not an active admin account: show a "no access" screen with a sign-out button.
- **Permissions are for display only.** The server checks every request. We use them to hide sidebar items and buttons, and to block opening a screen the user has no permission for (show a message instead of the screen).
- Every item in `config/navigation.ts` has a `permission`, and the sidebar filters by it.
- Use `<Can permission="review-payments">` for buttons. Never check the role (`role === 'admin'`) anywhere — always the permission.
- **Key principle:** the payment reviewer cannot edit prices or grant extensions, and the Super Admin cannot approve payments. Don't try to work around this in the UI.

| Permission | Screens |
|---|---|
| (any role) | Home `GET /admin/overview` (the `finance` field may be `null`) |
| `review-payments` | Payment queue, approve and reject |
| `view-merchants-and-customers` | Merchants, customers, cycles |
| `edit-business-identity` | Edit business name and type |
| `suspend-merchants` | Suspend/reactivate merchant, pause card |
| `grant-extensions` | Extend trial |
| `cancel-stamps` | Cancel a stamp |
| `edit-customer-birthdate` · `reveal-customer-phone` | Customer page |
| `manage-packages` | Packages and prices |
| `manage-settings` | Billing and app settings |
| `manage-lookups` | Business types and icons |
| `execute-deletion-requests` | Deletion requests |
| `view-financials` | Payment history and financial report |
| `view-audit-log` | Audit log |
| `manage-admin-accounts` | Admin accounts |

---

## Errors

- Error shape: `{ error: { code, message, details } }`.
- **User-facing text always comes from `error-messages.ts` by `code`.** `message` is English for developers only and is never shown. Any values the text needs come from `details`.
- `422 VALIDATION_FAILED`: `details.fields` = `{ field: [rule] }`. `applyFieldErrors(error, form.setError)` maps each rule (`required`, `min`, `taken`...) to Arabic text next to the field.
- `401`: redirect to sign-in. `403 FORBIDDEN`: Toast "دورك لا يسمح بهذه العملية" (your role doesn't allow this action).
- `429`: Toast using `retry_after_seconds`.
- Admin-specific errors: `PAYMENT_NOT_PENDING`, `TRIAL_NOT_EXTENDABLE` (with `reason`), `MERCHANT_STATUS_CONFLICT`, `DELETION_REQUEST_NOT_PENDING`, `REWARD_ALREADY_REDEEMED` (stamp cancellation). After any of these, refetch the item — someone else changed it.

---

## Data rules

- **Cursor pagination on every list:** `useInfiniteQuery` with `?cursor=&limit=20`; `meta.next_cursor = null` means the end. No page numbers. A `LoadMore` component goes under the table.
- **Filters live in the URL** (`searchParams`): `?status=PENDING&q=...`, so links can be saved and shared. Filters are part of the query key.
- **Dates:** arrive in UTC (ISO 8601). Displayed in `Asia/Damascus` time only via `lib/format.ts`, with Latin digits.
- **Amounts:** decimal strings (`"10.00"`). Display only — **never do math on them with `parseFloat`**. USD and SYP are always kept separate.
- **Payment proof images:** `proof_url` is a signed URL valid for 30 minutes. Use a short `staleTime` for payment details, and `refetch` when the image is opened.
- **Customer phone is always masked.** The "Show full number" button (`reveal-phone`) **is recorded in the audit log**, so a small confirmation dialog comes first. The full number is not kept in the cache after the page closes.
- **Customer search is by full phone number only**; there is no customer list.
- **No deletion** for packages, business types, icons or admin accounts: deactivate (`is_active: false`) instead. Don't add a "Delete" button for these.
- **Card icons:** `key` must be a Phosphor icon name and cannot change after creation. The create form shows a live icon preview and blocks submission if the name doesn't exist.
- **Every action takes a reason** (`reason`): suspend, reactivate, extend, edit identity, edit birthdate, cancel stamp. One shared `ReasonDialog` for all of them.
- **Before deleting a merchant:** show `stats.rewards_ready` in the confirmation dialog.
- After any mutation: invalidate the affected list and detail + `overview` (counts and alerts change).

---

## Design system

Same identity as the merchant and customer apps, with its own personality for the dashboard. **All components are built by us.** No shadcn, no ready-made component library.

### Colors ("ثقة رقمية" — Digital Trust)

All defined in `@theme` in `styles/globals.css`. **Never use hex colors in components** — always a token.

```css
@theme {
  /* Spacing: 4px (Tailwind v4 default) → p-4 = 16, gap-3 = 12, h-14 = 56 */
  --spacing: 0.25rem;

  /* Neutrals (from navy toward off-white) */
  --color-neutral-0: #FFFFFF;
  --color-neutral-50: #F7F7F5;
  --color-neutral-100: #E7E8E8;
  --color-neutral-200: #D7D9DB;
  --color-neutral-300: #C1C4C9;
  --color-neutral-400: #A3A8B1;
  --color-neutral-500: #868C99;
  --color-neutral-600: #6A7283;
  --color-neutral-700: #4D566B;
  --color-neutral-800: #2F3B53;
  --color-neutral-900: #14213D;

  /* Brand */
  --color-brand: #1B4F72;
  --color-brand-hover: #1A4465;
  --color-brand-pressed: #183858;
  --color-brand-soft: #E8EDF1;
  --color-brand-on: #FFFFFF;
  --color-teal: #17A398;
  --color-teal-soft: #E6F6F4;
  --color-amber: #F2B134;
  --color-amber-soft: #FDF3E1;
  --color-ink: var(--color-neutral-900);
  --color-paper: var(--color-neutral-50);

  /* Status */
  --color-success: #0E7C73;
  --color-success-soft: #E3F4F3;
  --color-warning: #C2410C;
  --color-warning-soft: #FCEBE3;
  --color-danger: #C8372D;
  --color-danger-soft: #FBEAE9;
  --color-info: #2F6FD6;
  --color-info-soft: #EAF1FC;

  /* Semantic names: components use these */
  --color-bg: var(--color-paper);
  --color-surface: var(--color-neutral-0);
  --color-fg: var(--color-ink);
  --color-fg-muted: var(--color-neutral-600);
  --color-fg-subtle: var(--color-neutral-500);
  --color-border: var(--color-neutral-200);
  --color-border-strong: var(--color-neutral-300);
  --color-focus: var(--color-brand);
}
```

### Color rules

- **Components use semantic names** (`bg-surface`, `text-fg-muted`, `border-border`). Raw `neutral-*` shades only for special cases with no semantic name.
- **Text:** primary is `fg`; secondary is at least `fg-muted` (`neutral-600`). `fg-subtle` and `neutral-400` are for placeholders, icons and disabled states only — **not for readable text** (contrast below 4.5:1).
- **`teal`** is for backgrounds, icons and large elements only. For green text use `success`. Never white text on `teal`.
- **`amber`** is a brand color: accents, stamps, highlights. **Not for statuses.** Text on it is always `ink`, never white. Use it — don't avoid it. Its fixed places: `Button variant="accent"` (the one highlighted action on a screen), `Badge tone="amber"` (e.g. "most popular", stamp counts), `StatCard tone="accent"` (the headline number), `Card highlight` (featured card), text selection, and the active-item indicator in the Sidebar.
- **All alerts use `warning`:** overdue payment, trial ending soon, grace period, duplicate reference.
- **Status pairs:** a Badge uses the `*-soft` background with the matching text color (`bg-danger-soft text-danger`).
- **Focus ring** `focus` on every interactive element: `focus-visible:ring-2 ring-focus ring-offset-2`.

### StatusBadge

| Status | Color |
|---|---|
| `ACTIVE` · `APPROVED` · `executed` | `success` |
| `TRIAL` | `info` |
| `GRACE` · `overdue` · `duplicate_reference` | `warning` |
| `EXPIRED` · `PENDING` · `pending` | `neutral` |
| `SUSPENDED` · `REJECTED` · `PENDING_DELETION` · `DELETED` | `danger` |
| `cancelled` · registration in progress (`status: null`) | `neutral` |

### Rules

- **RTL with logical properties only:** `ms-* me-* ps-* pe-* start-* end-* text-start`. **Forbidden:** `ml- mr- pl- pr- left- right- text-left`.
- Directional icons (arrows, chevrons) flip with `rtl:-scale-x-100`.
- Thmanyah font everywhere, Latin digits.
- **Base UI only inside `components/ui`.** Features import from `@/components/ui`, never directly from `@base-ui/react`.

### Components

- **Fully ours:** Button, IconButton, Input, Textarea, Field (label + error + hint), Badge, StatusBadge (all merchant, payment and request statuses), Card, StatCard, Table, PageHeader, Sidebar, Skeleton, EmptyState, ErrorState, LoadMore, Spinner.
- **Ours on top of Base UI:** Dialog, ConfirmDialog, ReasonDialog, Menu, Select, Combobox (for long filters), Popover, Tooltip, Toast, Checkbox, Switch, Tabs.

Every new component in `components/ui` is built before it's used in a screen, with all its states (default, hover, focus, disabled, loading, error).

---

## Environment variables

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...     # from the backend developer
CLERK_SECRET_KEY=sk_test_...                       # for proxy.ts only, never reaches the browser
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
```

The dashboard origin (local, staging, production) must be added on the backend to `CLERK_AUTHORIZED_PARTIES` (otherwise `401`) and `FRONTEND_URLS` (otherwise CORS errors).

---

## Deployment

- Same server as the backend. `output: 'standalone'` in `next.config.ts`; the Docker image runs `node server.js`.
- Nginx in front on the dashboard domain, with a staging copy on a separate domain.
- A step in the existing GitHub Actions pipeline: build → push image → restart.
- `NEXT_PUBLIC_*` values are baked in at build time, so each environment gets its own build.

---

## Build order

The dashboard comes first; the website is built after it.

1. Project setup, tokens, font, RTL, the two root layouts.
2. Core `components/ui` components, with a `/dev/ui` preview page (removed from production).
3. Auth: `proxy.ts`, sign-in page, `AdminProvider`, "no access" screen.
4. Shell: permission-based sidebar, header, API and error layer.
5. Screens in order: Home → Payment queue → Merchants (list, detail and actions) → Customers and cycles → Packages → Settings → Business types and icons → Deletion requests → Finance → Audit log → Admin accounts.
6. Website: next-intl setup, then its pages (to be planned separately).

---

## Forbidden

- Any API call from the website.
- Website imports from `features/`, `lib/api/` or `lib/auth/`; dashboard imports from `site/`.
- Hardcoded text in the website (use `messages/*.json`); next-intl in the dashboard.
- An `app/layout.tsx` at the top level.
- `fetch` or axios directly in a dashboard component, or any other API instance.
- Showing `error.message` to the user.
- Checking `role` instead of a permission.
- Any ready-made component library, or importing Base UI outside `components/ui`.
- `left/right` properties in CSS.
- `any`, or editing `schema.d.ts` by hand.
- Manual `useMemo`, `useCallback` or `memo` (React Compiler does it). Only exception: a value that must stay referentially stable for a specific reason (e.g. an effect dependency), with a comment explaining why.
- react-hook-form's `watch()` (breaks with React Compiler). Use `useWatch({ control, name })` instead.
- Server Actions or fetching API data in Server Components (dashboard).
- Math on amounts.
