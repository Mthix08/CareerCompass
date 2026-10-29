# CareerCompass — Claude project handoff

Paste this brief into Claude Code while its working directory is the CareerCompass project root. If using Claude’s web chat, upload the project source or a safe source archive together with `docs/CareerCompass_Design_Document/main.tex` and the lecturer’s DSW02B1 brief. A local path by itself does not give Claude web access to files.

## Task for Claude

Use the actual CareerCompass source and the supplied DSW02B1 practical-work brief to review and improve the single LaTeX design document at `docs/CareerCompass_Design_Document/main.tex`. Preserve the lecturer’s required sections: app conception and user narratives, UML domain model, categorized use cases, a relational model, sketches/service connections, and screen mockups or screen flows. Keep the relational model clearly labeled as a normalized coursework projection because the implemented database is Firestore, not SQL. Do not claim that screenshots, physical-device tests, Firebase production settings, or profiler/debugging demonstrations exist unless they are actually provided.

## Product overview

CareerCompass is an Expo / React Native mobile app for South African learners planning education and career pathways. It supports institution and course discovery, generic and institution-specific APS guidance, funding/bursary exploration, a personal application tracker and guide, career assessment, saved items, notifications/deadlines, user profile/authentication, and a CareerCompass assistant. It is a planning aid: learners must confirm requirements, funding eligibility, and deadlines with official institutions/funders; the app does not submit institution applications.

## Source map

- `screens/`: screens, navigation destinations, login/auth helpers, and Firebase initialization.
- `components/`: reusable UI, cards, and navigation components.
- `navigation/BottomTabNavigator.js`: Home, Funding, Universities, Courses, and Profile tabs.
- `context/`: profile/session, bookmarks, and language state.
- `data/`: institution/course data, APS rules/matching, bursary normalization, Firestore content loader, local assistant answers.
- `services/`: APS calculations, career-assessment persistence, translation, qualification requirements, and notification logic.
- `translation-worker/src/index.js`: Cloudflare Worker routes for `/assistant` and `/translate`; API credentials belong in Cloudflare secrets, never the app bundle.
- `docs/`: design document, project status, and this handoff.

## Main data and service design

- Firebase Authentication supports account sessions; Cloud Firestore stores user/profile data, applications, assessment records, shared content, and notices. Firebase Storage is used for profile-photo handling where configured.
- AsyncStorage keeps local profile/content/bookmark/assessment/funding caches for selected offline behavior.
- Shared Firestore collections used by the app include universities, colleges, courses, FAQs, application deadlines, and notices. User applications and notifications are under user subcollections; career assessments are stored by user ID.
- Funding options are fetched from the configured bursary API and cached; NSFAS also has a built-in record.
- The Worker proxies Gemini and DeepL so their API secrets stay server-side. The Worker has rate limiting and request validation. Do not put credentials into source, public `EXPO_PUBLIC_` variables, screenshots, or this handoff.
- APS rules vary by institution and admissions year. Some records are provisional; label and cite them rather than presenting them as official.

## Coursework requirements and evidence gaps

The lecturer’s brief asks for a single LaTeX design document, object-oriented domain UML, categorized use cases, relational model, sketches and UI mockups/flows; it also requires install/run evidence, debugging with breakpoint and variable state, a profiler screenshot, lifecycle logs, Firebase schema and CRUD evidence, functional use cases, non-functional/offline resilience evidence, a GitHub repository, and a presentation. The design document includes a checklist, but Claude must leave evidence marked outstanding until screenshots/tests are supplied. Do not invent team member names or project test results.

## Known verification state from the recent local session

- Expo lint passed after recent app changes. This is a JavaScript project without `tsconfig.json`.
- Android JavaScript export passed in an earlier check, but a complete APK/EAS build was not confirmed.
- The Cloudflare Worker was deployed and a terminal APS question once returned an answer. The app was later reported to fall back to offline text; source changes added one retry for temporary HTTP errors and a useful offline APS answer, but the fresh APK build did not submit.
- Home deadline cards were updated in source to include funding due within 30 days and highlight deadlines with five or fewer days remaining. Lint passed; device behavior still needs checking.
- Google sign-in, live Firebase contents/rules, real-device install, and the coursework evidence pack still require owner/device verification.

## Safe handoff instructions

If making a source archive for Claude web, include app source and documentation but exclude `node_modules`, generated `android/` or `ios/` folders, `dist/`, `.expo/`, `.firebase/`, `.env` files, `.dev.vars`, service-account JSON files, signing keys/keystores, and any file containing credentials or personal learner data. Claude Code can inspect the local source directly if it is opened at this project directory. Never paste the Gemini or DeepL key into Claude; rotate any key that has been exposed.
