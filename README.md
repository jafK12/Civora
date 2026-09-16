# Civora (Civic Service Locator & Accountability Tool)

**Civora** is an open civic service locator and transparency tool designed for African civic administrative structures. It empowers citizens to locate local public offices, inspect verified statutory fees and legal requirements, and anonymously report discrepancies (such as bribe solicitations, unauthorized requirements, or closed counters).

---

## Key Features

1. **Service Category Navigation**:
   - Filter civic offices by core service category:
     - `All Services`
     - `ID & Civil Registration`
     - `Business & Licensing`
     - `Land & Property`
   - Generalized administrative model (`officeLevel: "local" | "district" | "regional"`) adaptable across municipal structures without hardcoded country-specific administrative jargon.

2. **Map & Slide-Up Office Detail Sheet**:
   - Map centered over the metropolitan area showing active office markers.
   - Tapping an office marker opens an animated **bottom sheet overlay** that sits on top of the map (preserving map context in the background).
   - Tapping the map background or close handle dismisses the sheet.
   - Each service row expands to reveal statutory requirements, verified fees, operating hours, and legal citations.

3. **Trust & Verification Badges**:
   - Every service detail visibly displays its statutory source citation (e.g., Citizen Public Service Charter, Uniform Gazette Directives) and an ochre `"Last verified: [date]"` trust badge.

4. **Anonymous Discrepancy Reporting**:
   - Citizens can report 5 categories of issues:
     - `wrong info`
     - `bribe requested`
     - `closed during posted hours`
     - `extra undocumented requirement`
     - `other`
   - Privacy-first: **Anonymous mode defaults to ON** (no login or device tracking required).
   - Reports are stored locally via `@react-native-async-storage/async-storage` with in-memory fallbacks, generating an instant civic receipt confirmation.

---

## Design Tokens

Built strictly to the civic design specification (flat surfaces, clear 1px borders, zero drop shadows):

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `bg` | `#0F2A2E` | Deep teal primary headers, status bars, selected chips |
| `surface` | `#FFFFFF` | Crisp white flat cards and sheet backgrounds |
| `text` | `#12211F` | Dark civic teal text |
| `textMuted` | `#5B6E6A` | Secondary descriptions, timestamps, and subtitles |
| `accent` | `#C97A2B` | Ochre accent used sparingly on CTAs, verified badges, reports |
| `accentMuted` | `#F3E4D2` | Subtle ochre background tints for trust tags |
| `border` | `#DDE4E2` | Structural borders (replacing drop shadows) |

- **Typography**: Single system sans-serif hierarchy (17px titles, 15px body, 13px captions), with natural casing and no all-caps labels.
- **Low-End Performance**: Pure React Native StyleSheet layouts with lightweight iconography and standard animations to ensure fluid 60fps performance on budget smartphones.

---

## File Structure

```
civora/
├── backend/                         # Standalone Node & TypeScript REST API & Supabase schemas
│   ├── src/
│   │   ├── services/
│   │   │   ├── authService.ts       # Demo user accounts & role validation
│   │   │   ├── reportService.ts     # Rate-limiting, pattern detection, reply authorization
│   │   │   └── supabase.ts          # Backend Supabase client (service role)
│   │   ├── seed/
│   │   │   ├── seedData.ts          # Demo reports (pattern confirmed, responded, unverified)
│   │   │   └── seedRunner.ts        # Database / in-memory seeder
│   │   ├── types/
│   │   │   └── index.ts             # Backend data contracts
│   │   ├── server.ts                # HTTP REST API server (port 3001)
│   │   └── index.ts                 # Backend exports
│   ├── supabase/migrations/
│   │   └── 001_initial_schema.sql   # PostgreSQL schema, RLS policies, views & triggers
│   ├── package.json
│   └── tsconfig.json
├── frontend/                        # Expo React Native mobile & web app
│   ├── src/
│   │   ├── components/              # UI components (AuthModal, OfficeDetailSheet, CivicMap, etc.)
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Supabase authentication provider & demo persona switcher
│   │   ├── data/                    # Mock data & storage bridge
│   │   ├── screens/
│   │   │   ├── MapScreen.tsx        # Main civic map & office discovery
│   │   │   └── PublicReportsFeedScreen.tsx # Privacy-preserving reports feed & reply composer
│   │   ├── services/
│   │   │   ├── apiClient.ts         # REST client with automatic offline fallback
│   │   │   └── supabase.ts          # Mobile Supabase client with AsyncStorage
│   │   ├── theme/                   # High-contrast civic design tokens
│   │   └── types/                   # TypeScript contracts
│   ├── App.tsx                      # App root with AuthProvider
│   ├── app.json                     # Expo configuration (Civora)
│   └── package.json
├── .gitignore
├── LICENSE
└── README.md
```

---

## How to Run

### 1. Prerequisites
Ensure [Node.js](https://nodejs.org) (v18+) is installed.

### 2. Run the Backend API Server
```bash
cd backend
npm install
npm run build
npm start
# API listens at http://localhost:3001
```

### 3. Run the Frontend App
```bash
cd frontend
npm install
npx expo start
```
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal (macOS only).
- **Web Browser**: Press `w` in the terminal.

---

## Verification & Testing

### Frontend Typecheck
```bash
cd frontend
npx tsc --noEmit
```

### Backend Build & Seed
```bash
cd backend
npm run build
npm run seed
```
