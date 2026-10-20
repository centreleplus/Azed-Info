# Single-Fetch-On-Mount Architecture & Elimination of Periodic Reloads

Eliminate all background polling timers (`setInterval`), focus/route re-fetch listeners, and tab-switch network calls so that student data and documents are fetched **strictly once per active session** (exclusively upon Login or manual page reload `F5`), with all trimester, chapter, and category navigation operating instantaneously against local in-memory state.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Single-Fetch Session Lifecycle**: All periodic intervals (`4s` profile polling, `5s` session-check polling, `6s` notification polling) and route/focus re-fetch listeners (`hashchange`, `popstate`, `focus`) are permanently removed.
> - **Session-Scoped Memory Cache**: Fetched student documents (Courses, Devoirs, Corrections, Quizzes) are cached in memory for the active login session (`useRef` + session cache keyed by user ID) so switching between trimesters, chapters, or main sidebar views never triggers a second network request.

---

## 1. Overview & Core Concept

- **What It Does**: Converts the student platform from a polling-driven model to a deterministic **Fetch-Once-On-Mount** architecture.
- **Target Audience**: Students navigating courses, assignments, corrections, revisions, and interactive quizzes.
- **Key Value**: Zero screen flickering, zero periodic re-renders every 4–6 seconds, and instantaneous tab/trimester switching without loading spinners after initial session load.

---

## 2. User Experience & Interaction Flow

- **Initial Login or Page Reload (`F5`)**:
  - The user's profile and authorized pedagogical catalogue are fetched once.
  - Once loaded, the data is locked into local state and session memory.
- **Trimester & Chapter Tab Switching**:
  - Clicking between `"1er Trimestre"`, `"2ème Trimestre"`, `"3ème Trimestre"`, `"Live Enregistré"`, or chapter tabs filters the already-loaded array in memory via `useMemo` in `< 1ms` with zero network traffic and no loading spinner.
- **Window Focus & Route Changes**:
  - Switching browser tabs or navigating between student views preserves the current state without triggering background profile or document refreshes.

---

## 3. Key Architectural Decisions

- **Decision 1: Complete Removal of Background Polling & Focus Listeners**
  - *Chosen Approach*: Remove the 4-second `pollInterval` and `focus`/`hashchange`/`popstate` re-fetch listeners in authentication state, remove the `hashchange` profile re-fetcher in student sync, remove the 5-second session heartbeat interval in the root app, and remove the 6-second polling interval in notifications. Also stop dispatching `"document-updated"` during user profile sync.
  - *Why*: The 4-second auth poll was dispatching `"document-updated"` and creating new user object references every 4 seconds, forcing all document views to wipe their cache and re-fetch continuously.
- **Decision 2: Unfiltered Initial Fetch + Pure Client-Side Trimester Filtering**
  - *Chosen Approach*: Fetch all documents authorized for the student's `badge`, `grade`, and `stream` in a single request on initial mount (`useEffect` keyed strictly to `[]` / `userId`), store the full authorized list in a session cache + `useRef`, and apply `selectedTrimestre` and chapter filtering purely in memory.
  - *Why*: Removing `selectedTrimestre` from the network fetch dependencies ensures changing trimesters never triggers a network call.

---

## 4. Technical Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   LOGIN OR MANUAL PAGE RELOAD (F5)                       │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Executes Strictly Once)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│               INITIAL SINGLE-FETCH & SESSION CACHE STORE                 │
│  • Auth & Profile loaded once on mount ([] / userId)                     │
│  • Authorized Documents (Courses, Devoirs, Corrections, Quizzes)         │
│    fetched once without trimester query restriction                      │
│  • Stored in Session Memory Cache + Component useRef                     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (Zero Subsequent Network Calls)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│             INSTANT CLIENT-SIDE FILTERING (useMemo in RAM)               │
│  • 1. Badge Rank: USER_RANK[user.badge] >= USER_RANK[doc.minBadge]       │
│  • 2. Grade: doc.grade === user.grade || doc.grade === "ALL"             │
│  • 3. Stream: doc.stream === user.stream || doc.stream === "ALL"         │
│  • 4. Trimester: doc.trimester === selectedTrimester (Local Filter)      │
│  • 5. Category / Chapter: Instant local tab filtering                    │
└──────────────────────────────────────────────────────────────────────────┘
```
