# Insight Admin Panel - Folder Structure

**Project:** Production-grade React + Vite admin panel for Speeds Healthcare
**Framework:** React 19 + TypeScript + Vite + shadcn/ui + Tailwind CSS v4
**State Management:** Zustand + TanStack React Query
**Offline DB:** Dexie.js (IndexedDB)
**Testing:** Vitest + Playwright

---

## 📁 Complete Directory Tree

```
insight-admin-boilerplate/
│
├── 📂 .claude/                          # Claude Code & AI Configuration
│   ├── claude.json                      # Claude workspace config (name, version, build tools)
│   ├── mcp-servers.json                 # MCP servers (Google Drive, Figma, GitHub)
│   └── skills.json                      # Custom AI skills (component-generation, test-writing, type-safety)
│
├── 📂 .vscode/                          # VS Code Configuration
│   ├── settings.json                    # Editor settings (tabs, formatting, extensions)
│   ├── launch.json                      # Debugger config (Chrome, attach to port 9222)
│   └── extensions.json                  # Recommended extensions (ESLint, Prettier, Tailwind)
│
├── 📂 .github/                          # GitHub Configuration
│   ├── 📂 workflows/
│   │   ├── ci.yml                       # GitHub Actions: lint, test, build on PR
│   │   └── deploy.yml                   # GitHub Actions: auto-deploy to Azure on main
│   └── PULL_REQUEST_TEMPLATE.md         # PR template (description, testing, screenshots)
│
├── 📂 src/                              # 🔥 APPLICATION SOURCE CODE
│   │
│   ├── main.tsx                         # ✅ Entry point (React 19 root render)
│   ├── App.tsx                          # ✅ Root component (Router setup)
│   ├── index.css                        # ✅ Global styles (Tailwind directives @layer, @apply)
│   │
│   ├── 📂 components/                   # 🔧 React Components (Feature-based)
│   │   │
│   │   ├── 📂 ui/                       # shadcn/ui Base Components (Copy-paste, auto-imported)
│   │   │   ├── button.tsx               # <Button /> - Primary, secondary, outline variants
│   │   │   ├── card.tsx                 # <Card /> - Container for content
│   │   │   ├── dialog.tsx               # <Dialog /> - Modal (Close Visit confirmation)
│   │   │   ├── form.tsx                 # <Form /> - React Hook Form wrapper
│   │   │   ├── input.tsx                # <Input /> - Text input field
│   │   │   ├── tabs.tsx                 # <Tabs /> - Tabbed interface (Patient pills + workspace tabs)
│   │   │   ├── badge.tsx                # <Badge /> - Status chips (Critical, Warning, Good)
│   │   │   ├── dropdown-menu.tsx        # <DropdownMenu /> - User menu, actions
│   │   │   ├── sheet.tsx                # <Sheet /> - Sidebar drawer
│   │   │   ├── label.tsx                # <Label /> - Form labels
│   │   │   ├── textarea.tsx             # <Textarea /> - Multi-line input
│   │   │   ├── select.tsx               # <Select /> - Dropdown selector
│   │   │   ├── checkbox.tsx             # <Checkbox /> - Form checkboxes
│   │   │   └── tooltip.tsx              # <Tooltip /> - Hover hints
│   │   │
│   │   ├── 📂 layout/                   # Layout Wrapper Components
│   │   │   ├── AppHeader.tsx            # Top navigation bar (Insight logo, nav links, user menu)
│   │   │   ├── Sidebar.tsx              # Left sidebar (Navigation menu, collapsible)
│   │   │   ├── MainLayout.tsx           # Root layout wrapper (<Outlet /> for pages)
│   │   │   ├── ContextBar.tsx           # Breadcrumb/context bar (Site > Ward > Patient)
│   │   │   └── ThemeProvider.tsx        # Dark/light mode toggle + provider
│   │   │
│   │   ├── 📂 dashboard/                # Dashboard Page Components
│   │   │   ├── Dashboard.tsx            # Home page container (imports all sub-sections)
│   │   │   ├── GreetingStrip.tsx        # "Good morning" + quick actions
│   │   │   ├── ScheduleStrip.tsx        # Week view cards (days + visit counts)
│   │   │   ├── PriorityQueue.tsx        # Escalations list (Critical, Warning flags)
│   │   │   ├── SiteCards.tsx            # Site grid (compliance ring, last visit, start button)
│   │   │   ├── AnalyticsRow.tsx         # Charts (visits this month, raised vs closed, resolution rate)
│   │   │   ├── MedicineQueries.tsx      # Medicine queries table (SLA, status)
│   │   │   └── MessagesPanel.tsx        # News/alerts section (drug recalls, updates)
│   │   │
│   │   ├── 📂 workspace/                # Visit Workspace Components (Tabbed interface)
│   │   │   ├── VisitWorkspace.tsx       # Main workspace container (left tabs, main area, right checklist)
│   │   │   ├── WorkspaceHeader.tsx      # "Patient review — J.M." + save buttons
│   │   │   ├── PatientReviewForm.tsx    # Form for patient review (React Hook Form + Zod)
│   │   │   ├── PatientPills.tsx         # Tab selector (J.M., R.K., T.S. pills)
│   │   │   ├── WorkspaceNav.tsx         # Tab navigation (Review, Actions, Audits, Resus, Notes)
│   │   │   ├── WorkspaceTabPanel.tsx    # Renders active tab content
│   │   │   ├── VisitChecklist.tsx       # Right sidebar checklist (live status, clickable items)
│   │   │   ├── CloseVisitModal.tsx      # Exit modal (final checklist before closing)
│   │   │   ├── 📂 tabs/
│   │   │   │   ├── ReviewTab.tsx        # Patient Review form tab
│   │   │   │   ├── ActionsTab.tsx       # Ward Actions list tab
│   │   │   │   ├── AuditsTab.tsx        # Controlled Drugs Audit tab
│   │   │   │   ├── ResusTab.tsx         # Resus Bag checklist tab
│   │   │   │   └── NotesTab.tsx         # Free-text notes tab
│   │   │   └── 📂 audits/
│   │   │       ├── ClinicRoomAudit.tsx  # Clinic Room audit form
│   │   │       ├── STOMPAudit.tsx       # STOMP audit form (psychotropic medication)
│   │   │       ├── HDATAudit.tsx        # HDAT audit form (health data assessment)
│   │   │       └── RapidTransAudit.tsx  # Rapid Tranquilisation audit
│   │   │
│   │   ├── 📂 auth/                     # Authentication Components
│   │   │   ├── LoginForm.tsx            # Email + password login form
│   │   │   ├── ProtectedRoute.tsx       # Route guard (redirects to /login if no auth)
│   │   │   ├── PermissionGate.tsx       # RBAC permission wrapper (show/hide based on ability)
│   │   │   └── LogoutButton.tsx         # User menu logout action
│   │   │
│   │   └── 📂 common/                   # Shared/Utility Components
│   │       ├── Loading.tsx              # Full-screen or inline spinner
│   │       ├── ErrorBoundary.tsx        # React error boundary
│   │       ├── ErrorFallback.tsx        # Error page (404, 500, etc)
│   │       ├── NotFound.tsx             # 404 page
│   │       ├── Toast.tsx                # Notifications/alerts
│   │       └── ConfirmDialog.tsx        # Confirmation modal
│   │
│   ├── 📂 hooks/                        # Custom React Hooks (Business Logic)
│   │   ├── useAuth.ts                   # Auth state (user, token, login/logout)
│   │   ├── useAuthContext.ts            # Wrapper for AuthContext
│   │   ├── useVisitChecklist.ts         # Derives checklist status from queries (patient review + audits)
│   │   ├── usePatientReview.ts          # Patient review form logic (React Hook Form)
│   │   ├── useAudit.ts                  # Audit form state and submission
│   │   ├── useSyncOfflineData.ts        # Offline sync mutation (Dexie → API)
│   │   ├── useWebSocket.ts              # WebSocket listener (escalations, updates)
│   │   ├── useRBAC.ts                   # Permission checks (useAbility wrapper)
│   │   ├── useDarkMode.ts               # Theme toggle state
│   │   └── useDebounce.ts               # Debounce hook for search
│   │
│   ├── 📂 store/                        # Zustand State Management (Client UI State Only)
│   │   ├── uiStore.ts                   # UI state (selectedTab, selectedPatientId, modals)
│   │   ├── authStore.ts                 # Auth state (user, roles, permissions)
│   │   └── index.ts                     # Export all stores
│   │
│   ├── 📂 queries/                      # TanStack React Query Hooks (Server State)
│   │   ├── patients.ts                  # usePatients(), usePatient(id), usePatientReviews()
│   │   ├── audits.ts                    # useAudits(), useAudit(id), useAuditTypes()
│   │   ├── escalations.ts               # useEscalations(), useEscalationById()
│   │   ├── sites.ts                     # useSites(), useSiteById()
│   │   ├── actions.ts                   # useWardActions(), useActionById()
│   │   ├── queries.ts                   # useMedicineQueries(), useQueryById()
│   │   └── index.ts                     # Export all query hooks
│   │
│   ├── 📂 db/                           # Dexie.js Offline Database
│   │   ├── schema.ts                    # Dexie tables (PatientReview, Audit, etc)
│   │   ├── index.ts                     # Export db instance
│   │   └── migrations.ts                # DB version upgrades
│   │
│   ├── 📂 lib/                          # Utilities & Configuration
│   │   ├── api.ts                       # Axios instance + QueryClient setup
│   │   ├── utils.ts                     # Helper functions (formatDate, classNames, etc)
│   │   ├── constants.ts                 # App constants (API_BASE_URL, ROLES, etc)
│   │   ├── casl.ts                      # CASL ability config (RBAC rules)
│   │   ├── socket.ts                    # Socket.io instance & event listeners
│   │   ├── validators.ts                # Zod schema validators
│   │   └── storage.ts                   # LocalStorage/SessionStorage helpers
│   │
│   ├── 📂 types/                        # TypeScript Type Definitions
│   │   ├── index.ts                     # Global types (re-exports)
│   │   ├── patient.ts                   # Patient, PatientReview types
│   │   ├── audit.ts                     # Audit, AuditTemplate types
│   │   ├── escalation.ts                # Escalation, EscalationType types
│   │   ├── site.ts                      # Site, Ward, Establishment types
│   │   ├── actions.ts                   # WardAction, ActionStatus types
│   │   ├── api.ts                       # API response/request types
│   │   ├── auth.ts                      # User, Role, Permission types
│   │   └── forms.ts                     # Form submission types
│   │
│   ├── 📂 schemas/                      # Zod Validation Schemas
│   │   ├── patientReview.ts             # Patient review form schema
│   │   ├── audit.ts                     # Audit form schemas (ClinicRoom, STOMP, HDAT, RapidTranq)
│   │   ├── auth.ts                      # Login schema
│   │   ├── forms.ts                     # Reusable form schemas
│   │   └── index.ts                     # Export all schemas
│   │
│   ├── 📂 routes/                       # Routing Configuration
│   │   ├── index.tsx                    # TanStack Router config (all routes defined here)
│   │   ├── protectedRoutes.tsx          # Routes requiring authentication
│   │   └── adminRoutes.tsx              # Routes requiring admin role
│   │
│   ├── 📂 context/                      # React Context Providers
│   │   ├── AuthContext.tsx              # Authentication context (user, token)
│   │   ├── ThemeContext.tsx             # Dark/light mode context
│   │   └── index.tsx                    # Provider wrapper
│   │
│   └── 📂 test/                         # Test Configuration & Utilities
│       ├── setup.ts                     # Vitest setup (mocks, global config)
│       ├── mocks.ts                     # Mock data generators (Faker.js)
│       └── test-utils.tsx               # Render wrapper (QueryClientProvider, etc)
│
├── 📂 public/                           # Static Assets
│   ├── index.html                       # HTML entry point
│   ├── favicon.ico                      # Favicon
│   └── manifest.json                    # PWA manifest
│
├── 📂 tests/                            # 🧪 Test Files (Mirror src/ structure)
│   │
│   ├── 📂 unit/                         # Unit Tests (Vitest)
│   │   ├── 📂 components/
│   │   │   ├── PatientReviewForm.test.tsx       # Form validation, submission
│   │   │   ├── VisitWorkspace.test.tsx         # Tab switching, patient selection
│   │   │   ├── PriorityQueue.test.tsx          # Rendering escalations
│   │   │   └── Dashboard.test.tsx              # Dashboard layout
│   │   │
│   │   ├── 📂 hooks/
│   │   │   ├── useVisitChecklist.test.ts       # Checklist derivation logic
│   │   │   ├── useSyncOfflineData.test.ts      # Offline sync logic
│   │   │   └── useRBAC.test.ts                 # Permission checks
│   │   │
│   │   ├── 📂 store/
│   │   │   ├── uiStore.test.ts                 # Zustand state mutations
│   │   │   └── authStore.test.ts               # Auth state
│   │   │
│   │   └── 📂 lib/
│   │       ├── casl.test.ts                    # RBAC ability config
│   │       └── utils.test.ts                   # Helper functions
│   │
│   ├── 📂 e2e/                          # End-to-End Tests (Playwright)
│   │   ├── auth.spec.ts                 # Login flow
│   │   ├── dashboard.spec.ts            # Dashboard navigation
│   │   ├── workspace.spec.ts            # Visit workspace (patient selection, form fill)
│   │   ├── offline-sync.spec.ts         # Offline → online sync flow
│   │   └── visit-close.spec.ts          # Close visit modal checklist
│   │
│   └── 📂 fixtures/                     # Test Data
│       ├── patients.json                # Mock patient data
│       ├── audits.json                  # Mock audit templates
│       ├── escalations.json             # Mock escalations
│       ├── sites.json                   # Mock site data
│       └── mocks.ts                     # MSW mocks for API
│
├── 📂 scripts/                          # Build & Utility Scripts
│   ├── seed-db.ts                       # Populate Dexie with mock data (for development)
│   ├── generate-types.ts                # Generate TypeScript types from OpenAPI spec
│   ├── migrate-db.ts                    # Run Dexie schema migrations
│   └── build-report.ts                  # Analyze bundle size
│
├── 📂 docs/                             # Documentation
│   ├── ARCHITECTURE.md                  # System design & patterns
│   ├── SETUP.md                         # Getting started guide
│   ├── API.md                           # API endpoints & responses
│   ├── OFFLINE_SYNC.md                  # Offline sync strategy
│   ├── RBAC.md                          # Permission model
│   ├── DEPLOYMENT.md                    # Azure deployment
│   └── TROUBLESHOOTING.md               # Common issues & fixes
│
├── 📂 config/                           # Configuration Files (Non-Vite)
│   └── azure-deploy.yml                 # Azure Pipeline config
│
│
├── .env.example                         # Environment variables template
├── .env.local                           # Local secrets (git ignored)
├── .env.production                      # Production env vars
├── .gitignore                           # Git ignore rules
│
├── .eslintrc.cjs                        # ESLint config
├── .prettierrc.js                       # Prettier config
│
├── vite.config.ts                       # Vite build config (dev server, aliases, optimization)
├── vitest.config.ts                     # Vitest unit test config
├── playwright.config.ts                 # Playwright E2E test config
├── tailwind.config.ts                   # Tailwind CSS theme config
├── tsconfig.json                        # TypeScript compiler options
├── tsconfig.node.json                   # TypeScript for Node scripts
│
├── package.json                         # Dependencies & scripts
├── package-lock.json                    # Locked versions
│
└── README.md                            # Project overview
```

---

## 📋 Detailed Folder Descriptions

### 🔥 `src/` - Application Source Code

The heart of the application. All production code lives here.

#### `src/components/` - React Components

**Organized by feature domain, not by type.** Each folder contains complete features.

| Folder                  | Purpose                   | Contains                                                              |
| ----------------------- | ------------------------- | --------------------------------------------------------------------- |
| **`ui/`**               | shadcn/ui base components | Button, Card, Tabs, Dialog, Form, etc. Auto-imported via`@radix-ui/*` |
| **`layout/`**           | Page layout wrappers      | AppHeader, Sidebar, MainLayout (Outlet for routes)                    |
| **`dashboard/`**        | Home page sections        | PriorityQueue, SiteCards, Analytics panels, Messages                  |
| **`workspace/`**        | Visit workspace (tabbed)  | PatientReviewForm, WorkspaceTabs, VisitChecklist, CloseVisitModal     |
| **`workspace/tabs/`**   | Tab content components    | ReviewTab, ActionsTab, AuditsTab, ResusTab, NotesTab                  |
| **`workspace/audits/`** | Audit-specific forms      | ClinicRoomAudit, STOMPAudit, HDATAudit, RapidTransAudit               |
| **`auth/`**             | Authentication UI         | LoginForm, ProtectedRoute, PermissionGate                             |
| **`common/`**           | Reusable utilities        | Loading, ErrorBoundary, Toast, ConfirmDialog                          |

#### `src/hooks/` - Custom React Hooks

Each hook is a single file. No nested folders.

| Hook                        | Purpose                                              |
| --------------------------- | ---------------------------------------------------- |
| **`useAuth.ts`**            | Login/logout, token management, user context         |
| **`useVisitChecklist.ts`**  | Derives checklist status from TanStack Query results |
| **`usePatientReview.ts`**   | React Hook Form integration for patient review form  |
| **`useSyncOfflineData.ts`** | TanStack Query mutation for Dexie → API sync         |
| **`useWebSocket.ts`**       | Socket.io listener for real-time escalations         |
| **`useRBAC.ts`**            | CASL ability wrapper (permission checks)             |

#### `src/store/` - Zustand State Management

**Only UI state.** Server state goes in `/queries/` (TanStack Query).

| File               | State                                                     |
| ------------------ | --------------------------------------------------------- |
| **`uiStore.ts`**   | selectedTab, selectedPatientId, modals (isCloseVisitOpen) |
| **`authStore.ts`** | user, roles, token (hydrated from AuthContext)            |

#### `src/queries/` - TanStack React Query

Each file groups related queries. Example:

```typescript
// src/queries/patients.ts
export const usePatients = () => useQuery({...})
export const usePatientReviews = (visitId) => useQuery({...})
export const useCreatePatientReview = () => useMutation({...})
```

#### `src/db/` - Dexie.js (Offline Database)

IndexedDB wrapper for offline-first functionality.

| File                | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| **`schema.ts`**     | Dexie table definitions (PatientReview, Audit, etc) |
| **`index.ts`**      | Export`db` instance                                 |
| **`migrations.ts`** | Version upgrades (if schema changes)                |

#### `src/types/` - TypeScript Definitions

One file per domain. Each exports multiple related types.

```typescript
// src/types/patient.ts
export interface Patient { id, name, dob, ... }
export interface PatientReview { id, patientId, ... }
export type ReviewSeverity = 'Moderate' | 'Major' | 'For information'
```

#### `src/schemas/` - Zod Validation Schemas

Zod schemas (not TypeScript types). Used for form validation + API validation.

```typescript
// src/schemas/patientReview.ts
export const patientReviewSchema = z.object({
  drugCharts: z.number().min(0),
  interventions: z.string().optional(),
  severity: z.enum(['Moderate', 'Major', 'For information']),
})
```

---

### 🧪 `tests/` - Test Files

**Mirrors `src/` structure.** Easy to find corresponding tests.

```
src/components/workspace/PatientReviewForm.tsx
↓
tests/unit/components/PatientReviewForm.test.tsx
```

#### `tests/unit/` - Vitest Unit Tests

Fast, isolated tests for components, hooks, utilities.

#### `tests/e2e/` - Playwright E2E Tests

Full user flow tests. Slower but catch integration bugs.

#### `tests/fixtures/` - Test Data

Mock data, MSW (Mock Service Worker) for API interception.

---

### 📂 Root-Level Config Files

| File                       | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| **`vite.config.ts`**       | Build tool config (dev server, aliases, optimization) |
| **`vitest.config.ts`**     | Unit test runner config                               |
| **`playwright.config.ts`** | E2E test runner config                                |
| **`tailwind.config.ts`**   | CSS theme (colors, spacing, breakpoints)              |
| **`tsconfig.json`**        | TypeScript compiler options                           |
| **`.eslintrc.cjs`**        | Code linting rules                                    |
| **`.prettierrc.js`**       | Code formatting rules                                 |
| **`.env.example`**         | Environment variable template (commit this)           |
| **`.env.local`**           | Local secrets (git ignored)                           |

---

## 🎯 Common Workflows

### Adding a New Feature

```bash
# 1. Create component in src/components/workspace/MyFeature.tsx
# 2. Create hook in src/hooks/useMyFeature.ts (if needed)
# 3. Create TanStack Query in src/queries/myFeature.ts (if API call)
# 4. Create types in src/types/myFeature.ts
# 5. Create Zod schema in src/schemas/myFeature.ts
# 6. Create test in tests/unit/components/MyFeature.test.tsx
# 7. Import in parent component & connect to store/queries
```

### Adding a New Page/Route

```bash
# 1. Create component in src/components/[FeatureName]/[FeatureName].tsx
# 2. Add route in src/routes/index.tsx
# 3. Create layout wrapper in src/components/layout/[FeatureName]Layout.tsx
# 4. Create E2E test in tests/e2e/[feature].spec.ts
```

### Adding API Integration

```bash
# 1. Define types in src/types/api.ts (or domain-specific file)
# 2. Create Zod schema in src/schemas/[domain].ts
# 3. Create TanStack Query in src/queries/[domain].ts
# 4. Use hook in component via useQuery/useMutation
# 5. Test in tests/unit/queries/[domain].test.ts
```

### Adding Tests

```bash
# Unit test (component, hook, utility)
tests/unit/components/MyComponent.test.tsx
tests/unit/hooks/useMyHook.test.ts
tests/unit/lib/utils.test.ts

# E2E test (user flow)
tests/e2e/patient-review-flow.spec.ts
```

---

## 📊 Folder Statistics

| Folder           | Purpose          | Files | Notes                                 |
| ---------------- | ---------------- | ----- | ------------------------------------- |
| `src/components` | React components | 30+   | Feature-organized, not type-organized |
| `src/hooks`      | Custom hooks     | 8+    | Business logic hooks                  |
| `src/queries`    | TanStack Query   | 6+    | Server state management               |
| `src/types`      | TypeScript types | 10+   | One file per domain                   |
| `src/schemas`    | Zod validators   | 5+    | Form + API validation                 |
| `tests/unit`     | Vitest tests     | 20+   | Mirror src/ structure                 |
| `tests/e2e`      | Playwright tests | 5+    | Full user flows                       |

---

## 🚀 Quick Navigation

**I need to...**

- 📝 Add a form component → `src/components/workspace/MyForm.tsx`
- 🔌 Connect to API → `src/queries/myDomain.ts` + `src/types/myDomain.ts`
- ✅ Test a component → `tests/unit/components/MyComponent.test.tsx`
- 🌍 Test full flow → `tests/e2e/my-flow.spec.ts`
- 🎨 Update styling → `src/index.css` or component's className
- 🔐 Add permission check → `src/lib/casl.ts` + `<PermissionGate />`
- 💾 Store UI state → `src/store/uiStore.ts`
- 🗄️ Persist offline → `src/db/schema.ts` + `useSync...` hook
- 🎯 Add a route → `src/routes/index.tsx`

---

## 📝 Notes

- **No nested folders under `components/`** except `ui/`, `layout/`, `workspace/`, `auth/`, `common/`. Flat hierarchy after that.
- **Tests mirror source structure.** Easy to find what you're testing.
- **Types, schemas, queries are domain-organized.** One file per domain (patients.ts, audits.ts, etc).
- **Hooks are atomic.** One hook = one file. No sub-folders.
- **shadcn/ui lives in `src/components/ui/`.** Copy-paste components here (they're yours to modify).
- **Environment variables in `.env.*` files** (one per environment: local, dev, prod, test).

---

## 🔗 Related Documentation

- **Setup:** See `README.md` for installation
- **Architecture:** See `docs/ARCHITECTURE.md` for design patterns
- **API Integration:** See `docs/API.md` for endpoint specs
- **Offline Sync:** See `docs/OFFLINE_SYNC.md` for Dexie strategy
- **RBAC:** See `docs/RBAC.md` for permission model
- **Deployment:** See `docs/DEPLOYMENT.md` for Azure setup

---

**Last Updated:** September 14, 2026
**Maintained by:** Clarion Technologies
