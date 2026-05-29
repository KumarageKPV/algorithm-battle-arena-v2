# UI Migration Plan: Retro Dark Mode to "Premium Light-Mode UI"

## 1. Overview and Objective
The current frontend (`packages/web`) uses a custom "retro dark mode" style (e.g., MK4 fonts, `<color>-glow` custom tailwind classes, linear gradient backgrounds). The goal is to overhaul this styling to match the provided "Premium Light-Mode UI", a sophisticated and modern user interface utilizing standard web design principles, a soft color palette, and standard sans/serif typography.

The new UI is a React application exported from Figma, relying heavily on [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS v4](https://tailwindcss.com/) principles, along with component collections like Recharts and Radix UI. Since we are using Next.js with Tailwind CSS v3 on the original codebase, this migration will also map the new design definitions into our current tech stack context.

## 2. Infrastructure & Dependencies

### To Install
Run this in `packages/web`:
```bash
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle-group @radix-ui/react-toggle @radix-ui/react-tooltip class-variance-authority clsx cmdk date-fns embla-carousel-react input-otp motion next-themes react-day-picker react-dnd react-dnd-html5-backend react-hook-form react-resizable-panels react-responsive-masonry recharts sonner tailwind-merge vaul
```

### To Remove
- Unnecessary fonts logic (MK4 TTF).
- Old custom CSS variables/components if redundant.

## 3. Tailwind Configuration and Globals 

### Color Palette & Theme Configuration
The new system is based on an extensive color mapping. We will carry these over to `globals.css` and update Next.js `tailwind.config.ts`.
- **Primary Font**: Replace MK4 with `Inter`, `Space Grotesk`, and `JetBrains Mono` (via `next/font/google`).
- **Globals Mapping**: Copy the contents of `Design Premium Light-Mode UI/src/styles/theme.css` standard variables (`--background: #FFF8EF`, `--primary: #E53935`, etc.) into `packages/web/src/app/globals.css`. Transform the Tailwind v4 `@theme inline` structure into standard Tailwind v3 `tailwind.config.ts` extended properties for Next.js.

### Tailwind Plugin
Add `tailwindcss-animate` plugin and set up color integrations in the `tailwind.config.ts` referencing your new CSS variables. 

## 4. Component Foundation Migration

The new design leverages a pre-built UI library set modeled on `shadcn/ui`. 
1. **Copy UI Components Folder**: 
   Transfer `docs/Design Premium Light-Mode UI/src/app/components/ui` to `packages/web/src/components/ui`.
2. **Setup Component Utilities**:
   Ensure `docs/Design Premium Light-Mode UI/src/app/components/ui/utils.ts` (often containing `cn` tailwind-merge function) is copied over and properly aliased via `packages/web/src/lib/utils.ts`.
3. **Shell & Navigation**:
   Transfer components like menus, sidebars, and basic layouts from `docs/Design Premium Light-Mode UI/src/app/components/shell` to serve as our root layouts (`packages/web/src/app/layout.tsx`).

## 5. Page-by-Page Integration Plan

For each route, we will replace the legacy interface with the new screen template, while carefully porting over the underlying React state, hooks, and API integrations (`axios`/`socket.io`).

| Old Route in `packages/web/app/` | New UI Screen Equivalent (`components/screens/`) | Priority | Note |
| --- | --- | --- | --- |
| `login` & `register` | `AuthPages.tsx` | High | Port over JWT and state forms. |
| `student-dashboard` | `StudentDashboard.tsx` | High | Needs charts logic (Recharts). |
| `teacher` | `TeacherDashboard.tsx` | High | Transfer stats APIs & Rechart hooks. |
| `admin` | `AdminDashboard.tsx` | Medium | Move generic table management. |
| `lobby` & `create-challenge` & `host-battle` | `LobbyPage.tsx` & `CreateChallengePage.tsx` etc. | High | Involves heavy Socket.IO logic mapping. |
| `match` | `MatchPage.tsx` | High | Move Monaco editor and test runner websockets. |
| `leaderboard` | `LeaderboardPage.tsx` | Low | Replace static styled elements with new grids. |
| `teacher-chat` | `TeacherChatPage.tsx` | Low | Bind to existing WebSockets for team messages. |

## 6. Migration Execution Strategy
1. **Phase 1: Foundation (Days 1-2)**
   - Install all missing dependencies.
   - Update `tailwind.config.ts`, `globals.css` and font loading in `layout.tsx`.
   - Copy the entire `--ui` library components hierarchy.
2. **Phase 2: Authentication and Layouts (Days 3-4)**
   - Update `app/layout.tsx` to include `AppShell` patterns from the new design.
   - Re-wire Login and Registration.
3. **Phase 3: Core Dashboards (Days 5-7)**
   - Wire standard API endpoints to Student and Teacher Dashboards.
4. **Phase 4: Complex Interactive Pages (Days 8-10)**
   - Replace Lobby, Matchmaking, and live IDE interfaces using the Socket context. This is the riskiest phase and will require thorough testing.
5. **Phase 5: Cleanup & Polish**
   - Remove unused dark-mode hooks, old toast systems (replace with `sonner`), and old custom components.

## 7. Next Steps
Review the new structure visually on `/test` routes to ensure basic functionality before finalizing replacements of the core pages.

