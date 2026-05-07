# Jungle Padel — Tournament Console

Landscape-first web app for setting up and running padel tournaments at Jungle Padel Bali. Designed to be mirrored from a phone to a big screen at the club.

---

## Brand & visual identity

- **Fonts** — DM Sans (body / UI) + "Hate Your Writing" (custom brand display, self-hosted from `HateYourWriting.ttf`) + JetBrains Mono (numerals). Pulled directly from the fonts used on junglepadel.com.
- **Color palette** — deep forest `#1B3024`, signature lime `#C8E66B`, cream `#F2EBDB`, paper `#FBF6E9`, Bali clay `#C97A4A` (used sparingly for live timer dot / low-time warnings).
- **Texture** — subtle SVG noise grain + radial lime/forest glows + faint palm-leaf decorative SVGs in two corners.
- **Logo** — Full wordmark image (`Full logo.png`) in the top-left corner of the brand bar.

---

## Top bar (always visible)

- Brand wordmark on the left.
- Three-tab pill nav in the center: **Tournament · Rounds · Timer · Score**.
- Right side:
  - **Format + round counter**: e.g. "Americano · Round 4 / 12" — updates live as you advance rounds.
  - **"Ends in" countdown**: ticks every second, calculated from `endTime − now`. Pulsing clay dot. Rolls to next-day if end time has already passed.

---

## Tab 1 · Tournament (setup)

The configuration screen. Two-column bento layout (collapses to single column on tablet/phone).

### Left panel — settings

- **Editable tournament name** (default: "Americano"). Click to type. Mirrored to the Rounds tab title — edit in either place, both update.
- **Format selector** (3 cards):
  - **Americano · points** — first team to a target score wins the round
  - **Americano · timed** — round ends on the clock; highest score wins
  - **King of the court** — winners stay, losers rotate after each match
- **Partners** (2 cards):
  - **Rotating** — true Americano, everyone partners with everyone (12-round rotation table for 12 players)
  - **Fixed** — pairs stay together all night, opponents rotate (5-round round-robin among 6 pairs for 12 players)
  - Switching modes swaps the player roster panel between individual seeds and pair builder.
- **Target value** (changes label/values per format):
  - Points: 8 / 16 / 24 / 32 / **Other** (custom input)
  - Timed: 10 / 15 / 20 / 25 / Other
  - KOTC: 3 / 5 / 7 / 10 / Other
  - **"Other" pill** — click and an inline number input slides in. Type any positive integer; flows straight into the round logic.
- **Players + Courts** (linked, 4 players per court):
  - Players: 4 / 8 / 12 / 16 / 20 / 24
  - Courts: 1 / 2 / 3 / 4 / 5 / 6
  - Pick either — the other auto-updates. Hint reads "12 players · 3 courts" live.
- **Tournament ends at** — `HH:MM` text input. Validates on blur, snaps back if invalid.
- **Generate pairings & start** CTA.

### Right panel — summary card + roster

- **Summary card** (forest green):
  - Editable tournament name (synced with Rounds tab).
  - Pretty subtitle: "32 points per round · 3 courts · 12 players" (changes with format).
  - Live "now" stamp `DD MMM · HH:MM` refreshing every 30 seconds.
  - **4 stat tiles**: Rounds · Avg per round · Total play · Per round (target).
  - **Round 1 preview**: dynamic list of court matchups using actual rotation table and player names. Each row shows the court chip + Pair A · vs · Pair B. Adapts to court count; missing rotation entries show dimmed `— & —`.
- **Roster panel**:
  - Rotating mode → N individual player input rows with seed numbers, in a 3-column grid.
  - Fixed mode → N/2 pair-builder rows (`Player A & Player B`), in a 2-column grid.
  - Title and lede update to match mode.
  - Inputs lift on focus with a lime focus ring; the dot grows when focused.

---

## Tab 2 · Rounds (live scoring)

The hero view that gets mirrored to the big screen.

- **Round header**:
  - Round pill: "Round 04 · 12" (current · total)
  - Editable tournament title + format-aware meta (e.g. "Americano · 32 pts per round")
  - Live counters: Courts (3), Players (12)
- **Court rows** (one per court, dynamic count):
  - Court tag floats above (e.g. "Court 1") — small caps DM Sans.
  - **Team A** on the left — two players with avatar circles + names in italic editorial type.
  - **Score block** in the middle — large mono numerals (76px) with a clean two-dot CSS colon, flanked by lime ± buttons.
  - **Team B** on the right — mirrored team layout.
  - Tap a score number → opens **numpad modal** (see below).
  - The leading team's score turns leaf-green; zeros are dimmed.
  - In points-mode, both team scores always sum to the target — adjusting one auto-fills the other (`partner = target − value`).
- **Action bar**:
  - Tournament progress bar with 11 dashed ticks for round count.
  - "Started 11:58 · Ends 14:46 · ~ 14 min/round" — calculated live from `STATE.startTime`, `STATE.endTime`, `STATE.totalRounds`.
  - **Previous round** button (left, secondary) — disabled at round 1.
  - **Confirm & next round** button (right, primary) — disabled at last round.
  - Going back loads that round's stored scores (scores are keyed per round, so back-and-forth navigation never loses data).

### Numpad modal (score entry)

- Opens when you tap any score number.
- Header shows court name + the duo entering ("Anika & Bram").
- Mode caption changes by format:
  - Points: "Tap a score · 0 to 32 · opponent auto-calculates"
  - Timed/KOTC: "Tap a score · 0 to N"
- Live preview pill on the right: `self : opponent`.
- 11-column grid of buttons from `0` to target. Active value is highlighted forest/lime.
- **Keyboard input** also works inside the modal: digits append (multi-digit support), `Backspace` deletes, `Enter`/`Esc` close.
- Click outside or press × to close.
- Press feedback (`scale(0.94)`) on every button.

---

## Tab 3 · Timer (round clock)

Big-screen round timer for timed-format Americano.

- **Round pill** (lime) + format meta on top.
- **Animated SVG ring** around a giant `MM:SS` mono counter. Stroke length tracks remaining time.
- **Last-30-seconds** state: digits + ring shift to clay color (low-time warning).
- **Pause state**: colon stops blinking and dims.
- Caption underneath: "PAUSED · TAP PLAY TO START" / "PLAYING · TAP TO PAUSE" / "ROUND OVER · TAP END ROUND".
- **Controls**:
  - **Reset** — back to round length, paused
  - **Start / Pause / Resume** (primary, lime button with play/pause icon swap + label change)
  - **End round** — advances to next round, reloads pairings, resets clock
- Default round length: 15 minutes (will be wired to the timed-format pill choice).

---

## Tab 4 · Score (leaderboard)

- **Live standings** title in editorial italic.
- Legend strip: P (played) · W (won) · +/− (point diff) · Pts (total)
- **Leaderboard table** sorted by total points descending:
  - Rank · Player (with avatar circle + name) · P · W · +/− · Pts
  - Top 3 get special accent treatment:
    - 1st: lime avatar + star prefix on rank
    - 2nd: forest avatar with lime initials
    - 3rd: clay avatar
  - Diff coloring: green for positive, clay for negative.

---

## Cross-cutting features

### State management

A single `STATE` object holds: format, partners, target, players, courts, startTime, endTime, totalRounds, currentRound, scores, leaderboard, name. All views read from this and re-render via dedicated functions:
- `renderCourts()`, `renderRoundChrome()`, `renderPlayers()`, `renderPreview()`, `renderMeta()`, `renderLeaderboard()`, `renderTimer()`, `renderTimeLabels()`.

### Live time logic

- `STATE.startTime` is captured on app load (`nowHHMM()`).
- `STATE.endTime` defaults to current time + 2:48 rounded up to the nearest quarter hour.
- "Ends in" countdown ticks every second, recomputed from `endTime − now`.
- `~ N min/round` computed live as `(end − start) / totalRounds`.
- Updating end-time input (with `HH:MM` validation) re-runs all time labels immediately.

### Rotation table

Pre-computed 12-round rotation for 12 players (`ROTATION` array). Each round defines pairings for 3 courts. Sliced to `STATE.courts` for smaller setups; padded with dashes if courts exceed available rotation entries.

### Tournament name sync

Two contenteditable elements (Tournament summary card + Rounds title) mirror each other via `setTournamentName()`. Edit in either, both update. Enter blurs to confirm.

### Title editing UX

Pencil icon on hover, dashed underline, lime focus ring with subtle lift. No layout shift on edit (transform-based).

### Animation principles (Emil-design-eng inspired)

- All transitions specify exact properties (no `transition: all`).
- Custom strong easing curve: `cubic-bezier(0.23, 1, 0.32, 1)` (--ease-out).
- Press feedback (`scale(0.97)` to `0.92`) on every clickable button, sized to the button's prominence.
- Score buttons get the most pronounced feedback (`0.92`) since they're tapped most.
- Start button uses subtle `0.985` because it's full-width.
- Tab switches fade-and-rise (4px translate) on enter.
- Timer colon blinks at 1s step intervals; pauses when timer is paused.
- Animated drop-shadow + glow on the timer ring.

---

## Responsive behavior

The app is optimized for landscape big-screen mirroring (≥ 1100px) but degrades gracefully at smaller widths:

- **`< 1100px` (tablet / phone landscape)**:
  - Topbar stacks (brand+tabs / status on second row); tabs become horizontally scrollable.
  - Setup grid stacks to single column.
  - Players grid drops to 2 columns.
  - Round nav buttons stack full-width.
  - Round header stacks.
- **`< 768px` (phone portrait)**:
  - Two-col setup field (Players + Courts) stacks.
  - Pair builder goes single-column.
  - Court rows stack vertically (Team A · Score · Team B).
  - Numpad shrinks to 6 columns.
  - Pairings preview rows stack chip on top + names below.
  - Timer view tightens; controls allow wrapping.
  - Score table allows horizontal scroll.
- **`< 480px` (small phone)**:
  - Numpad to 5 columns.
  - Players grid single column.
  - Pills + tabs shrink slightly.
- **Pill groups always wrap** when content can't fit.

---

## Files

- `index.html` — single-file app (HTML + inline `<style>` + inline `<script>`)
- `Full logo.png` — top-left brand wordmark
- `Logo.png` — square gorilla logo (legacy, currently unused)
- `HateYourWriting.ttf` — brand display font (self-hosted from junglepadel.com)
- `BrandingApp.png`, `Buttons.png`, `ExmapleApp.png` — design references

---

## Future / not-yet-wired

- The "Generate pairings & start" button is non-functional (UI only) — wiring needs to commit setup → start an actual tournament session.
- Timer's round length is hardcoded to 15 min; should pull from the timed-format pill selection.
- Player names in the rotation are hardcoded (`Anika`, `Bram`, …) — typing into the roster doesn't yet update the rotation/preview.
- Editable tournament name persists only in the live DOM, not in storage.
- The leaderboard data is mocked — real scoring would aggregate `STATE.scores` per player across rounds.
- Sit-out logic: not implemented (per user direction — no sit-outs).
- Fixed-partners rotation table: only the round count differs (5 vs 12); the actual fixed-partner pairings table is not yet pre-computed.
