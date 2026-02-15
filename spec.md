# Description

I want to build a quiz app, similar to Kahoot. It should let authenticated users build and host quizes, with multiple choice questions and non-authenticated users should be able to join a quiz. During the quiz, there is a timer for each question, after which the users see if they answered correct or not. Between each question, a scoreboard is presented briefly.

I want the app to be built in the quiz-time project, and the backend api is built in the api project.

The frontend should use

- Angular
- Tailwind
- @angular/components
- State manegement with Signals
- JWT for authentication

The backend should use

- Express
- Authentication
- Middleware
- Repository pattern
- Error handling
- Micro service architechture
- OATH (This we can add later)

# Design

It should follow a modern design, but I'm not sure what I want here so build 5 different suggestion from which I can choose for the frontend.

## Chosen design direction

We will use **Approach 4: Card Stack Mobile-First**, adapted into a dual-mode UX:

- **Admin/Host UX**: desktop-optimized for quiz creation and administration.
- **Live Participant UX**: mobile-optimized for joining and answering during live sessions.

## Product UX modes

### Mode A: Admin (Desktop-first)

For authenticated users creating and hosting quizzes.

Primary goals:

- Efficient quiz authoring
- Session control (start/pause/next question/end)
- Visibility into participants and scores

### Mode B: Live Quiz (Mobile-first)

For non-authenticated participants joining via code/link.

Primary goals:

- Fast join flow
- Large touch targets for answers
- Clear timer, feedback, and scoreboard transitions

## Route strategy (frontend)

Separate route groups by context:

- `/admin/*` for authenticated desktop workflows
- `/host/*` for live host controls (desktop)
- `/play/*` for participant live flow (mobile)

Recommended route map:

- `/admin/login`
- `/admin/dashboard`
- `/admin/quizzes`
- `/admin/quizzes/new`
- `/admin/quizzes/:quizId/edit`
- `/host/session/new`
- `/host/session/:sessionId/lobby`
- `/host/session/:sessionId/live`
- `/play/join`
- `/play/session/:sessionId`

## Sprint-ready backlog

### Epic 1 — Foundations and architecture

**Story 1.1: App shells for dual UX modes**

- Build two layout shells in Angular:
  - AdminShell (desktop patterns)
  - LiveShell (mobile patterns)
- Acceptance criteria:
  - Admin routes always use AdminShell
  - Play routes always use LiveShell
  - No desktop-only navigation appears in play mode

**Story 1.2: Shared state with Signals**

- Create signal-based state slices:
  - `authState`
  - `quizBuilderState`
  - `sessionState`
  - `leaderboardState`
  - `uiModeState`
- Acceptance criteria:
  - Session state changes propagate to host and participant screens without manual refresh
  - UI mode is derived from route context

**Story 1.3: Auth and guest access boundaries**

- Admin/Host uses JWT auth
- Play supports guest join token/code
- Acceptance criteria:
  - Unauthorized users cannot access `/admin/*` and `/host/*`
  - Guests can join `/play/*` without full account login

### Epic 2 — Desktop admin and hosting

**Story 2.1: Quiz management dashboard (desktop)**

- Quiz list, search/filter basics, create/edit entry points
- Acceptance criteria:
  - Authenticated user can list, create, and open quizzes for editing
  - Layout optimized for >= 1024px

**Story 2.2: Quiz editor (desktop)**

- Add/edit multiple-choice questions, options, correct answer, and timer per question
- Acceptance criteria:
  - User can reorder questions
  - Validation prevents invalid quiz publish/start

**Story 2.3: Host control panel (desktop)**

- Start session, control question progression, monitor live responses
- Acceptance criteria:
  - Host can move session through states: `lobby -> question-open -> question-closed -> scoreboard -> finished`
  - Host sees participant count and response progress in near real time

### Epic 3 — Mobile participant experience

**Story 3.1: Join flow (mobile-first)**

- Enter code/name and join active session quickly
- Acceptance criteria:
  - Join completes in <= 3 interaction steps
  - Clear error for invalid/expired session code

**Story 3.2: Question screen (mobile-first)**

- Single-column card stack, large answer buttons, prominent timer
- Acceptance criteria:
  - Answer options are easy to tap on small screens
  - Selection lock behavior prevents duplicate submissions

**Story 3.3: Feedback and scoreboard transitions**

- Post-answer result state and between-question scoreboard
- Acceptance criteria:
  - Participant sees correct/incorrect feedback after question closes
  - Scoreboard appears between questions and auto-transitions back to next question

### Epic 4 — Backend contracts and reliability

**Story 4.1: Session lifecycle API and domain model**

- Define session lifecycle and enforce transitions server-side
- Acceptance criteria:
  - Invalid state transitions return clear errors
  - Session state is the single source of truth for frontend views

**Story 4.2: Role-based endpoint segmentation**

- Host/admin mutation endpoints vs participant answer endpoints
- Acceptance criteria:
  - Middleware enforces JWT roles for admin/host APIs
  - Participant APIs limited to join/read/answer actions

**Story 4.3: Error handling and response contracts**

- Standardize API error payloads and validation errors
- Acceptance criteria:
  - Frontend can map all common errors to user-friendly messages
  - No unhandled 500 errors in normal invalid-input scenarios

### Epic 5 — Testing, quality, and rollout

**Story 5.1: Frontend tests by viewport context**

- Component/integration tests for admin desktop and play mobile states
- Acceptance criteria:
  - Critical admin flows are tested on desktop viewport assumptions
  - Critical play flows are tested on mobile viewport assumptions

**Story 5.2: End-to-end journey tests**

- E2E: host starts session, participant joins, answers, sees scoreboard
- Acceptance criteria:
  - One green happy-path test for complete quiz roundtrip
  - One negative-path test for invalid join code

**Story 5.3: Pilot and tuning**

- Run pilot with 1 host + multiple participants
- Acceptance criteria:
  - Collect usability feedback on timer clarity and tap accuracy
  - Apply prioritized UX fixes before broader rollout

## Definition of done (overall)

- Admin workflows feel efficient on desktop/laptop form factors
- Live participant flow is comfortable and fast on mobile devices
- Session state is consistent across host and participant views
- JWT/guest access controls are correctly enforced
- Core tests pass for both desktop-admin and mobile-play paths

## Suggested implementation order

1. Epic 1 (foundations)
2. Epic 4 (backend lifecycle/contracts)
3. Epic 2 (desktop admin/host)
4. Epic 3 (mobile live play)
5. Epic 5 (tests + pilot tuning)
