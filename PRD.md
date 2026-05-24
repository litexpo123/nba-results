# PRD: NBA Conference Finals Tracker

## Problem Statement

I want a way to glance at the current NBA Conference Finals — see the series scores, results of finished games with box scores and photos, and when the next games are scheduled — without navigating around ESPN's homepage, dealing with ads, or being shown unrelated leagues, regular-season news, or fantasy content. I don't need live updates. I just want a clean, focused view of the two Conference Finals series, runnable locally on my machine.

## Solution

A locally-run React + TypeScript single-page app that displays exactly two NBA series — the Eastern Conference Finals (CLE vs NYK) and the Western Conference Finals (OKC vs SAS) — as side-by-side tabs. Each series shows a matchup hero (both team logos + current series score), then a chronological list of all games in the series. Finished games are clickable and open a modal with full box score (line score, top scorer hero, player stat tables for both teams). Scheduled games appear dimmed with their start time in the user's local timezone. The app pulls all data from ESPN's unofficial JSON endpoints at page load and uses TanStack Query's defaults for free refresh-on-focus. No live polling, no backend, no deployment — just `npm run dev`.

## User Stories

1. As an NBA fan, I want to open the app and immediately see which Conference Finals series are being tracked, so that I don't need to navigate anywhere to find them.
2. As an NBA fan, I want to see the current series score (e.g., "OKC leads 2-1") for each Conference Finals series, so that I know the standing of each series at a glance.
3. As an NBA fan, I want to see both team logos prominently at the top of each series card, so that I can identify the matchup visually.
4. As an NBA fan, I want to switch between the Eastern and Western Conference Finals using tabs, so that I can focus on one series at a time on smaller screens.
5. As an NBA fan, I want to see all games in a series listed in chronological order, so that I can follow the progression of the series.
6. As an NBA fan, I want finished games to display the final score of both teams, so that I can see results without clicking through.
7. As an NBA fan, I want the winning team's final score to be displayed in their primary team color, so that I can quickly identify the winner of each game.
8. As an NBA fan, I want each team's row in the series card to have a subtle colored accent in their primary color, so that team identity is reinforced visually without being garish.
9. As an NBA fan, I want to click a finished game to see its full box score, so that I can review the details of the game.
10. As an NBA fan, I want the box score to open in a modal dialog rather than a separate page, so that I don't lose my place in the series view.
11. As an NBA fan, I want to see a "top scorer" hero at the top of the box score with the player's headshot and stat line, so that I immediately know who had the standout performance.
12. As an NBA fan, I want to see the quarter-by-quarter line score (e.g., "BOS 28-25-30-22 = 105"), so that I can understand the flow of the game.
13. As an NBA fan, I want to see full player stat lines (MIN, PTS, REB, AST, FG, 3P, FT, +/−) for both teams in a table, so that I can scan individual performances.
14. As an NBA fan, I want each player row in the box score to include a small player headshot, so that the table feels more personal and less like a spreadsheet.
15. As an NBA fan, I want scheduled (not-yet-played) games to appear in the chronological list with reduced opacity, so that I can see the full series shape including future games.
16. As an NBA fan, I want scheduled games to be non-clickable, so that I don't accidentally try to open a box score that doesn't exist yet.
17. As an NBA fan, I want scheduled game times displayed in my local timezone (with the abbreviation shown, e.g., "8:00 PM PT"), so that I know when to tune in without doing timezone math.
18. As an NBA fan, I want the app to use my browser's detected timezone automatically, so that I don't have to configure anything.
19. As an NBA fan, I want a centered spinner to appear while data is loading, so that I know the app is working.
20. As an NBA fan, I want a clear "Couldn't load games" message if ESPN's endpoints fail, so that I'm not stuck on an indefinite spinner.
21. As an NBA fan, I want the app to refresh data when I return to the browser tab, so that I see current results without manually refreshing.
22. As an NBA fan, I want to open the box score and close it without affecting any other state, so that exploring games feels lightweight.
23. As a developer, I want to run the app with `npm run dev` and see it at localhost without any server-side setup, so that I have zero ops overhead.
24. As a developer, I want the four tracked teams defined in a single config file, so that I can change them in one place when the Finals start or when Conference Finals change in future seasons.
25. As a developer, I want all data fetching cached and deduplicated by TanStack Query, so that switching between tabs doesn't trigger redundant requests.
26. As a developer, I want the ESPN client to expose typed, clean domain objects (`Game`, `BoxScore`, `PlayerStatLine`), so that the rest of the app never sees ESPN's raw JSON shape.
27. As a developer, I want pure logic modules (game classification, series matching, date formatting, team colors) separated from React components, so that they can be tested independently.
28. As a developer, I want unit tests on the pure logic modules using Vitest, so that I catch regressions in date formatting, game state classification, and series matching.

## Implementation Decisions

### Stack and Build

- **Build tool:** Vite with the `react-ts` template. No SSR, no router.
- **Language:** TypeScript with strict mode.
- **Component library:** shadcn/ui copied into the repo, styled with Tailwind CSS. Specifically: `Card`, `Tabs`, `Dialog`, `Avatar`, `Badge`, `Skeleton` (only if used), `Button` (for dialog close).
- **Data fetching:** TanStack Query (`@tanstack/react-query`). One `QueryClient` provider at the app root. Default cache settings — refetch on window focus, refetch on mount.
- **Routing:** None. Single page. Tabs for conference selection, Dialog for box scores.
- **Hosting:** Local only. `npm run dev`. No deployment configuration.

### Data Source

- ESPN's unofficial JSON endpoints under `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/`. Called directly from the browser; CORS permits this.
- Two endpoint families used:
  - **Team schedule:** `teams/{teamAbbrev}/schedule` — returns a team's full season including playoffs.
  - **Game summary:** `summary?event={gameId}` — returns full box score including line score, player stats, and event status.

### Series Resolution

- The four tracked teams are hardcoded in a single config module. Approximate shape:
  ```ts
  export const SERIES = [
    { id: 'east', label: 'Eastern Conference Finals', teamA: 'CLE', teamB: 'NYK' },
    { id: 'west', label: 'Western Conference Finals', teamA: 'OKC', teamB: 'SAS' },
  ];
  ```
- For each series, the app fetches one team's schedule, filters to playoff-type games where the opponent's abbreviation matches the other team in the matchup, and orders chronologically. This gives the full series including both played and upcoming games.

### Deep Modules

Five pure modules carry the logic and are independent of React:

1. **`espnClient`** — wraps the two ESPN endpoints. Exposes `getTeamSchedule(teamAbbrev): Promise<Game[]>` and `getGameSummary(gameId): Promise<BoxScore>`. Hides URL construction, raw response parsing, and ESPN's JSON shape. Returns typed domain objects.
2. **`seriesMatcher`** — pure function. `matchSeries(schedule: Game[], opponentAbbrev: string): Game[]`. Filters to playoff games against the named opponent, ordered chronologically.
3. **`gameStateClassifier`** — pure function. `classifyGame(game: Game): 'final' | 'scheduled' | 'in-progress'`. Centralizes interpretation of ESPN status codes.
4. **`dateFormatter`** — pure wrapper around `Intl.DateTimeFormat`. Exposes `formatGameStart(isoString: string): string` returning a string like "Wed May 27, 8:00 PM PT" using the browser's detected timezone.
5. **`teamColors`** — pure lookup. `getTeamColors(abbrev: string): { primary: string; secondary: string }`. Hardcoded map for at least the four tracked teams plus a neutral fallback.

### UI Components

All presentational, composed top-down:

- **`App`** — sets up `QueryClientProvider`, renders the page shell.
- **`SeriesTabs`** — shadcn `<Tabs>` with one tab per entry in `SERIES`. Each tab content renders a `SeriesCard`.
- **`SeriesCard`** — composes `MatchupHero` and a chronological list of `GameRow` components. Fetches via a `useSeriesGames(series)` hook.
- **`MatchupHero`** — two large team logos with "vs" between them, team names, current series score derived from finished games.
- **`GameRow`** — one finished or scheduled game. Finished rows show two team rows (logo, abbrev, final score colored if winner) and are clickable to open `BoxScoreDialog`. Scheduled rows show date/time in local TZ and are visually dimmed.
- **`BoxScoreDialog`** — shadcn `<Dialog>` containing `TopScorerHero`, `LineScore`, and two `PlayerStatsTable`s.
- **`TopScorerHero`** — medium player headshot + name + stat line of the game's highest-scoring player.
- **`LineScore`** — table of quarter-by-quarter scoring for both teams plus totals.
- **`PlayerStatsTable`** — table of all players for one team with columns MIN, PTS, REB, AST, FG, 3P, FT, +/−. Each row includes a small `<Avatar>` headshot.
- **`TeamLogo`** — `<img>` with size variants.
- **`PlayerHeadshot`** — wraps `<Avatar>` with the player's image URL and fallback initials.
- **`LoadingSpinner`** — centered spinner shown while top-level series data is loading.
- **`ErrorMessage`** — shown when a query fails.

### Visual Treatment

- Default to the neutral shadcn palette.
- Each team's row in `GameRow` gets a thin left border in that team's primary color.
- In a finished `GameRow`, the winning team's final score is rendered in their primary color; the losing team's stays neutral.
- No other team-color use elsewhere — heavy branding is explicitly out of scope.

### State and Refresh

- TanStack Query's default `staleTime` (0) and default `refetchOnWindowFocus` (true) used as-is.
- No manual refresh button.
- No background polling.
- Box-score queries triggered only when a dialog opens (enabled flag tied to dialog state).

## Testing Decisions

### What makes a good test in this codebase

- Tests assert only on external behavior — return values of pure functions, observable output strings, classification verdicts.
- Tests never inspect internal state, mock React render trees, or assert on internal data structures.
- Tests use Vitest with no DOM dependency — these are pure-function unit tests, not component tests.
- Tests are deterministic — date formatting tests pass an explicit IANA timezone instead of relying on the host machine.

### Modules with tests

- **`seriesMatcher`** — fixtures containing mixed schedules (regular season + playoffs against multiple opponents); assert correct filtering and chronological ordering.
- **`gameStateClassifier`** — fixtures for each ESPN status state (pre, in-progress, post, postponed); assert correct mapping.
- **`dateFormatter`** — fixtures with several ISO timestamps and explicit timezones passed in; assert formatted string output.
- **`teamColors`** — assert known teams resolve to expected hex codes and that an unknown abbreviation falls back to a defined neutral.

### Modules without tests

- **`espnClient`** — thin wrapper; verified manually by running the app.
- All React components — verified by visual inspection during development.

### Prior art

None. Greenfield project. Vitest configured per the standard Vite TS template.

## Out of Scope

- Live or near-live updates (polling, WebSockets, SSE).
- Any series other than the two Conference Finals (no regular season, no first-round, no Finals — until the config is manually updated).
- Historical data, prior seasons, season records, standings.
- Photos beyond team logos and player headshots — no Getty action shots, no recap article images, no highlight thumbnails.
- Play-by-play data, team-level stats, advanced stats, shot charts.
- User accounts, favorites, settings, persisted preferences.
- Search, filtering, sorting beyond chronological game order.
- Routed URLs for individual games or series; nothing is bookmarkable.
- OG share images / social card previews.
- Mobile-specific layouts beyond what shadcn/Tailwind responsive primitives give for free.
- Deployment, CI/CD, hosting beyond local `npm run dev`.
- Internationalization, accessibility audits beyond shadcn's defaults.

## Further Notes

- The two Conference Finals teams are confirmed by the user from voice input. The West opponent ("psurs") was interpreted as **SAS (Spurs)** based on phonetic match; if this turns out to be wrong (e.g., user meant Suns / PHX), it's a single-line edit in the series config.
- The project is single-user and personal. Operational concerns (rate limiting, error reporting, logging, telemetry) are deliberately ignored. Total ESPN request volume per session is ~4 (two schedule fetches + one box-score fetch per dialog open).
- If ESPN changes the shape of either endpoint, the app breaks. This is accepted risk for a free, unofficial data source. Manual remediation only.
- The PRD intentionally specifies no file paths. The structure of `src/` is left to implementation discretion.
