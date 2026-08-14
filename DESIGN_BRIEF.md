# OneVoice Na — UI/UX Design Brief

A design brief for a full visual redesign of **OneVoice Na**, a civic reporting + legislative engagement app for Namibia (Windhoek first). Hand this to a designer to produce high-fidelity mockups.

**Aesthetic target:** modern, calm, and unmistakably **Apple/iOS-native** — the app should feel like it belongs next to Apple's own Settings, Maps, and Find My apps. Clarity over decoration. Content first. Generous whitespace. Soft depth, never heavy.

---

## 1. What the app does (context for the designer)

Citizens use OneVoice Na to:
1. **Report** municipal issues (potholes, water leaks, power outages, broken traffic lights, uncollected garbage) with a photo + GPS location.
2. **See a live map** of what's being reported around them (NEW — see §7).
3. **Reach emergency services** fast (Police / Ambulance / Fire).
4. **Read & rate proposed laws** and comment on them.
5. **Send suggestions** directly to government ministries.
6. **Track their submissions** and watch the government's status change (Received → In Progress → Resolved).

An **AI automatically triages every report** as **Critical / Medium / Light**, and **duplicate reports of the same problem merge** into one item with a "N citizens reported this" counter. The severity + count system is a core visual motif — it must be beautiful and instantly legible.

There is also a **web admin dashboard** (for city officials) and a **public web map** — redesign notes for those are in §11.

---

## 2. Design principles

1. **Deference.** The UI gets out of the way; the citizen's content (their report, the map, a law) is the hero.
2. **Clarity.** One primary action per screen. Legible type. Meaning carried by hierarchy and spacing, not borders and boxes.
3. **Depth, softly.** Layering via translucency (materials/blur) and gentle shadows — the iOS sense of planes, never skeuomorphic.
4. **Calm confidence.** This is civic infrastructure. It should feel trustworthy, quiet, and official — not gamified or loud. Color is used sparingly and always meaningfully (severity, status, action).
5. **Effortless.** Reporting an issue should take under 20 seconds. Reduce fields, autofill location, remember the person.

---

## 3. Visual language

### 3.1 Look & feel
- **iOS large-title navigation:** big bold screen titles that collapse into a compact centered title on scroll.
- **Inset grouped lists** (like the Settings app): rounded content cards on a light gray canvas, hairline separators inset from the left.
- **Materials & vibrancy:** translucent blurred bars (tab bar, nav bar, map filter bar, bottom sheets) that let content scroll under them.
- **Bottom sheets** (like Maps / Find My) for map detail and quick actions — draggable, with a grabber handle, detents at ~30% / ~90%.
- **SF Symbols-style iconography:** thin-to-medium weight line icons, consistent optical size, filled variants for selected/active states.
- **Rounded, friendly geometry:** cards and sheets with large corner radii; pill-shaped chips and buttons.
- **Full light + dark mode**, designed in parallel (dark mode is not an afterthought).
- **Safe areas respected:** Dynamic Island / notch at top, home indicator at bottom. Design for iPhone 15/16 class devices (393×852 pt reference).

### 3.2 Color tokens

Use a restrained, mostly-neutral palette with one brand accent and a strict semantic severity/status set.

| Token | Light | Dark | Use |
|---|---|---|---|
| **Brand / Accent (Civic Blue)** | `#0A84FF` | `#0A84FF` | Primary actions, links, selected tab, focus |
| **Brand Ink** | `#0B1F3A` | `#EAF0F8` | Wordmark, dark hero surfaces |
| **Namibian Gold** (sparingly) | `#E8B04B` | `#F0C069` | Small brand accents, celebratory moments only |
| Canvas (grouped bg) | `#F2F2F7` | `#000000` | Screen background |
| Surface (card) | `#FFFFFF` | `#1C1C1E` | Cards, list groups, sheets |
| Surface raised | `#FFFFFF` | `#2C2C2E` | Sheets over cards, popovers |
| Label primary | `#1C1C1E` | `#FFFFFF` | Titles, body |
| Label secondary | `#3C3C43` @ 60% | `#EBEBF5` @ 60% | Subtitles, metadata |
| Label tertiary | `#3C3C43` @ 30% | `#EBEBF5` @ 30% | Placeholders, disabled |
| Separator | `#3C3C43` @ 18% | `#545458` @ 40% | Hairlines |
| **Severity — Critical** | `#FF3B30` | `#FF453A` | Highest-urgency reports |
| **Severity — Medium** | `#FF9F0A` | `#FF9F0A` | Everyday disruptions |
| **Severity — Light** | `#8E8E93` | `#8E8E93` | Cosmetic / low urgency |
| **Status — Received** | `#0A84FF` | `#0A84FF` | Just submitted |
| **Status — In Progress** | `#FF9F0A` | `#FF9F0A` | Being worked on |
| **Status — Resolved** | `#34C759` | `#30D158` | Fixed |
| Emergency red | `#FF3B30` | `#FF453A` | SOS / emergency surfaces |

Severity color must **never** be the only signal (accessibility): always pair with a label and/or icon.

### 3.3 Typography
System font (**SF Pro Text / Display**; SF Pro Rounded for numeric badges & the wordmark). Dynamic Type support required.

| Style | Size / Line | Weight | Use |
|---|---|---|---|
| Large Title | 34 / 41 | Bold | Screen titles (top of scroll) |
| Title 1 | 28 / 34 | Bold | Section heroes |
| Title 2 | 22 / 28 | Bold | Card headers |
| Title 3 | 20 / 25 | Semibold | Sub-headers |
| Headline | 17 / 22 | Semibold | Row titles, emphasized body |
| Body | 17 / 22 | Regular | Paragraphs, inputs |
| Callout | 16 / 21 | Regular | Secondary body |
| Subhead | 15 / 20 | Regular | Metadata |
| Footnote | 13 / 18 | Regular | Timestamps, captions |
| Caption | 12 / 16 | Regular/Semibold | Badges, tiny labels |

### 3.4 Spacing, radius, elevation
- **4-pt spacing grid.** Screen side margins **20**. Card inner padding **16**. Common gaps: 8 / 12 / 16 / 24 / 32.
- **Radii:** cards & sheets **16–20**, sheet top **24**, buttons **14**, chips/pills **full (999)**, avatars **full**.
- **Elevation (light):** soft shadow `y+4, blur 16, black @ 6–8%`; raised sheets `y+8, blur 24, @ 10%`. **Dark:** prefer hairline borders + surface lightening over shadows.
- **Hit targets** ≥ 44×44 pt.

### 3.5 Motion
- Spring-based, 0.3–0.5s, ease-out. Screen pushes slide; tab switches crossfade; sheets spring up.
- **Micro-interactions:** press → scale 0.97 + subtle dim; submit success → gentle checkmark draw + **haptic** (success). Pull-to-refresh with the standard iOS spinner.
- Respect **Reduce Motion** (swap springs for fades).

---

## 4. Information architecture & navigation

Reorganized for clarity. **Bottom tab bar (translucent material), 4 tabs**, plus **Emergency elevated to a persistent red SOS button** in the nav bar (top-right of every screen) — always one tap away, never buried.

| Tab | SF Symbol (idea) | Purpose |
|---|---|---|
| **Report** (home) | `square.and.pencil` | Create a report; the default landing screen |
| **Map** | `map` | Live map of nearby reports (NEW) |
| **Participate** | `building.columns` | Laws (rate/comment) + Ministries (suggestions), via a segmented control |
| **Activity** | `clock.arrow.circlepath` | The user's submissions + live government status |

> **Emergency:** a compact red **SOS** pill pinned top-right on every screen → opens a focused Emergency sheet (Police / Ambulance / Fire, tap-to-call). This elevates the public-safety feature and keeps the tab bar clean.
> *Alternative if the client prefers:* a 5th red **Emergency** tab. Designer should mock both and recommend.

Merging Laws + Ministries into **Participate** (an iOS **segmented control** at the top: `Laws | Ministries`) is what frees the slot for the new Map tab while keeping ≤5 tabs (Apple's guidance).

---

## 5. Component library (design these as reusable components, light + dark, all states)

1. **Buttons** — Primary (filled Civic Blue, 14 radius, 50 pt tall), Secondary (tinted/gray), Plain (text), Destructive (red). States: default / pressed / disabled / loading (inline spinner).
2. **Inset list group + rows** — grouped card with hairline separators; row variants: label+value, label+chevron, toggle, input, multiline.
3. **Text fields / text areas** — inside grouped cards, floating clear button, focus accent underline or ring.
4. **Segmented control** — for Participate (Laws/Ministries) and map filters.
5. **Category chips** — horizontally scrolling pill row; selected = filled Civic Blue.
6. **Severity badge** — pill with color + label + optional SF Symbol (Critical `exclamationmark.triangle.fill`, Medium `exclamationmark.circle`, Light `circle`). Also a compact dot variant for the map.
7. **Status pill / timeline** — Received → In Progress → Resolved as a 3-step horizontal timeline with the active step colored; compact pill version for lists.
8. **"N citizens reported this" counter** — a small stacked-avatars + count treatment; feels social and credible.
9. **Report card** — photo thumbnail (or category glyph), title, severity badge, status pill, distance/address, count. Used in Activity and the Map sheet.
10. **Tab bar** (translucent), **Nav bar** (large-title + collapsing) with the **SOS** button, **bottom sheet** (grabber + detents), **toast/alert**, **rating stars**, **empty state** (icon + title + subtitle), **skeleton loaders**, **avatar/identity chip**.

---

## 6. Screen-by-screen (redesign each; provide light + dark)

### 6.1 Onboarding / Identity
- Warm, minimal. Wordmark **OneVoice Na** in SF Rounded, one line of value copy.
- Two inset fields: **Full name**, **Phone number**. One primary button **Get Started**.
- Copy reassures privacy: name & number stay on the device, attached to submissions so authorities can follow up.
- Optional: a subtle Namibia-inspired gradient or a soft topographic map motif behind the header (very restrained).

### 6.2 Report (home)
- Large title **Report an issue**. A quiet identity chip ("Reporting as Maria · edit").
- **Grouped form**, top to bottom:
  - **Details** card: Title field, Description text area.
  - **Category**: horizontally scrolling chips (Pothole, Water, Power, Traffic Light, Streetlight, Garbage, Other) with SF Symbols per category.
  - **Photo**: large tappable tile → shows thumbnail with a "Change"/remove control once chosen.
  - **Location**: "Use my location" row with a small inline map preview once fetched (pin on a mini map), plus editable address.
- **Primary button** pinned near the bottom: **Submit report**.
- On submit: success sheet showing the **AI-assigned severity** ("Classified as **Critical**") + one-line AI summary, with a subtle checkmark animation + success haptic. If it merged with a nearby report, say "12 citizens have now reported this."

### 6.3 Map (NEW) — see §7 for the full spec.

### 6.4 Participate (Laws + Ministries)
- Large title **Participate**. **Segmented control**: `Laws` | `Ministries`.
- **Laws list:** inset cards, each a proposed law with title + 2-line summary + a small average-rating indicator. Tap → **Law detail**: full summary in a reading-optimized card, a **star rating** control, a comment field, and **Submit feedback**. Show existing sentiment subtly (e.g., "1.2k citizens rated this 4.3★") if available.
- **Ministries list:** rows with a ministry glyph, name, code, chevron. Tap → **Suggestion form**: Subject, Proposal text area, optional attachment, **Send to ministry**.

### 6.5 Activity (History)
- Large title **Activity**. Inset list of the user's submissions (Reports, Law feedback, Ministry suggestions), newest first, each showing type icon, title, timestamp, and **status**.
- **Reports show the live government status** as a colored pill/timeline (Received → In Progress → Resolved) — this is the emotional payoff; make it satisfying.
- Offline drafts show a **"Waiting to send"** state with a subtle sync affordance; a top banner offers "Retry now."
- Empty state: friendly icon + "Your reports and feedback will appear here."

### 6.6 Emergency (SOS sheet)
- Opened from the persistent SOS button. A focused sheet with three large tap-to-call cards: **Police 10111**, **Ambulance**, **Fire**. Each card: color-coded (blue / red / orange), big icon, service name, number, and a phone glyph. One tap dials. Keep it dead simple and reassuring — this is used in a panic.

---

## 7. The Map screen (NEW — design in depth)

**Goal:** let a citizen instantly see what's being reported around them, colored by urgency — the app's transparency centerpiece.

### Layout
- **Full-bleed map** (Apple Maps look & feel; standard/muted style, not satellite by default).
- **Report pins** = severity-colored markers (Critical red / Medium amber / Light gray). Marker **size scales with the report count**; a badge shows the count when > 1. **Cluster** pins when zoomed out (a rounded count bubble that expands on tap/zoom).
- **Floating filter bar** at top over a **blurred material**: a scrolling row of chips — `All` · `Critical` · `Water` · `Power` · `Roads` · `Waste` · `Lighting`. Selected chip = filled.
- **"Locate me"** circular button (bottom-right, above the sheet).
- **Bottom sheet** (draggable, grabber handle, detents ~30% / ~90%):
  - **Collapsed (~30%):** "Nearby reports" title + a horizontally scrollable row (or short list) of the closest reports as **Report cards** (severity, title, distance, status, count).
  - **Expanded (~90%):** full scrollable list of area reports with filter/sort (Nearest / Most reported / Most urgent).
- **Primary FAB — "＋ Report here":** a Civic Blue button that starts a new report **pre-filled with the map-center location** (or the tapped pin's location). This ties the map back to the core action.

### Report detail (from a pin or card) — a bottom sheet
- Photo (if any), **severity badge**, title, description.
- **Status timeline** (Received → In Progress → Resolved) with dates.
- **"👥 14 citizens reported this"** counter.
- Distance + address; a small "Directions" affordance optional.
- Two actions: **"I'm seeing this too"** (increments the count / merges the citizen's confirmation) and **"Report a new issue here."**

### States
- **Permission not granted:** a calm prompt card explaining why location helps, with "Enable location" (map still usable, centered on Windhoek).
- **No reports nearby:** friendly empty message in the sheet + a "Be the first to report" CTA.
- **Loading:** shimmering skeleton cards in the sheet; map tiles fade in.
- **Offline:** last-known pins shown with a subtle "Offline — showing cached reports" banner.

### Implementation note (for whoever builds it after design)
The app runs in **Expo Go (SDK 54)**. Two viable paths — designer needn't decide, but be aware:
- **Native maps** (`react-native-maps`, Apple Maps on iOS) = the most "Apple" feel; Android needs a dev build.
- **WebView + Leaflet/MapLibre** = works everywhere in Expo Go today and can reuse the existing web map + the `/api/v1/reports/public` data feed.
Design to the native-maps ideal; it degrades gracefully to the WebView approach.

---

## 8. Iconography & imagery
- **SF Symbols** (or a line-icon set matching SF's weight/optical size). Filled variants for active/selected.
- **Category glyphs:** Pothole `road.lanes`, Water `drop.fill`, Power `bolt.fill`, Traffic Light `light.beacon.max`, Streetlight `lightbulb`, Garbage `trash`, Other `ellipsis.circle`.
- Photos are user-supplied; frame them in 16 radius, 4:3, with a subtle inner border in dark mode.
- Avoid stock illustration; if any spot art is needed (empty states), keep it monoline and on-brand.

---

## 9. Accessibility
- **Dynamic Type**: layouts must reflow up to XXL.
- **Contrast** ≥ WCAG AA for text; never rely on color alone (pair severity/status with labels + icons).
- **VoiceOver** labels for every control; the map exposes reports as an accessible list.
- **Reduce Motion / Reduce Transparency** honored (swap blur for solid surfaces).
- Full **dark mode**.

---

## 10. Tone & copy
Plain, warm, respectful, Namibian-context aware. Short. Action-first ("Submit report", "Send to ministry"). Reassuring on privacy and follow-up. Avoid bureaucratic jargon. Celebrate civic action lightly ("Thanks — that's on its way to the City of Windhoek").

---

## 11. Web surfaces (secondary — style to match)

### Admin dashboard (city officials)
- Clean, modern, **light** SaaS dashboard (not the iOS look, but the same color/severity system and restraint).
- Left/top nav: **Reports · Laws · Ministry Suggestions**.
- **Reports** = a triage table sorted by severity, with the severity badge, "N citizens reported" counter, photo thumbnail, AI summary, reporter, location, and an inline **status** control. Add a small **map view toggle** and simple stat tiles (open by severity, avg resolution time).
- Elegant data density: hairline rows, generous cell padding, one accent color, good empty/loading states.

### Public web map
- The mobile Map screen's desktop sibling: full-bleed map, severity-colored pins, filter chips, a side panel list. Same tokens.

---

## 12. Deliverables requested from the designer
1. **Design tokens** (colors, type, spacing, radii, elevation) as a style sheet / Figma variables — light + dark.
2. **Component library** (§5), all states, light + dark.
3. **High-fidelity screens** (§6 + §7), light + dark, at iPhone 15/16 reference size:
   Onboarding · Report (empty + filled + submit-success) · **Map (collapsed sheet, expanded sheet, pin detail, permission & empty states)** · Participate (Laws list, Law detail, Ministries list, Suggestion form) · Activity (with statuses + offline) · Emergency SOS sheet.
4. **Motion notes** for the key transitions and micro-interactions (§3.5).
5. **App icon** concept for "OneVoice Na" (a single, memorable civic mark; works at 1024px and tinted).
6. Optional: **web admin + public map** key screens (§11).

**North star:** if a judge picked up the phone and didn't know it was a hackathon project, it should feel like a shipped, first-party iOS app for Namibia.
