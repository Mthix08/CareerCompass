# CareerCompass Project Status and Next Steps

**Project review**  
27 October 2026

## Overall status

The core mobile app is substantially built, but it is not ready to call complete until cloud configuration and real-device checks pass. Google sign-in, Firebase content completeness, and production verification remain release blockers.

## What was reviewed and changed

- The chatbot no longer calls Gemini directly from the phone. It sends the learner's question to the Cloudflare Worker, which keeps the Gemini API key server-side, validates and rate-limits requests, and returns only the answer.
- The chatbot has a 20-second timeout, a local offline response when the Worker is unavailable, and a note warning learners not to enter passwords, ID numbers, or banking details into online questions.
- Funding code no longer presents fabricated sample bursaries as live opportunities. It relies on available live or cached data and handles malformed or expired deadlines more carefully.
- Course detail pages gained a requirements checklist based on available subject data. This is a planning aid until each requirement is confirmed against official institution sources.
- APS and course screens received clearer scope wording and state-handling changes as part of the consistency pass.

## Verification completed

| Check | Result |
|---|---|
| ESLint on changed JavaScript files | Passed |
| Worker assistant proxy checks | Passed: success, missing key, oversized question, and no key in response |
| Worker syntax and Git whitespace check | Passed |
| TypeScript check | Not applicable as a project check: this is a JavaScript app and has no `tsconfig.json` |
| Android build and device test | Not run. The Gemini secret and updated Worker deployment are still needed before the fresh APK can be verified. |

## Work still needed before release

Finish these in order. Some require the project owner's Firebase, Google, or Cloudflare account and cannot be verified from source code alone.

| Priority | Remaining work | Completion evidence |
|---|---|---|
| Release blocker | Add the Gemini API key as the Cloudflare Worker secret `GEMINI_API_KEY`, then deploy the updated Worker. | `POST /assistant` returns an answer without exposing the key. |
| Release blocker | Build a fresh Android preview APK and test the chatbot online and offline. | New APK shows the online privacy note, answers online, and uses the local fallback offline. |
| Release blocker | Resolve Google sign-in `DEVELOPER_ERROR`. Check the Firebase Android package name, SHA-1/SHA-256 fingerprints for the EAS signing keystore, OAuth client ID, and Firebase app configuration. | A newly signed APK completes Google sign-in on a physical Android device. |
| Data blocker | Confirm and populate courses and universities in Firebase. The supplied admin screenshot showed 0 universities and 0 courses but 50 colleges; check whether that still reflects the live database. | Admin counts and mobile lists show the same current data. |
| Data quality | Complete college and university profiles from official sources: programmes, campuses, accreditation notes, application links, prospectuses, and application dates. | Published facts include official source links and a last-checked date; unknowns remain blank. |
| Offline readiness | Test auth persistence and cached reference data with Wi-Fi off, including a cold restart. | A signed-in user remains signed in and cached screens load offline; expired sessions are handled clearly. |
| Access control | Exercise guest restrictions and signed-in features, including APS access, saved items, sign-out, and admin-only pages. | Guests cannot reach restricted functions through normal screens or direct navigation. |
| Operations | Check bursary and deadline records for duplicates, expiry, sources, and freshness. Define reminder scheduling and notification permissions before adding push reminders. | Test records pass add, edit, display, and expiry flows. |

> Course requirements vary by campus, qualification, year, and applicant category. The checklist must not replace official admission rules.

## Coursework requirements checklist

The supplied DSW02B1 brief requires more than a working app. The following submission and demonstration evidence is still outstanding or has not been verified in this code review:

| Assessment area | What the brief expects | Current review status |
|---|---|---|
| Run on a mobile device | Install and run the app on a real device; an emulator-only demonstration receives partial marks. | A fresh APK and real-device walkthrough still need to be completed after the cloud changes. |
| Design document | One LaTeX document with app conception and user narratives, UML domain class diagram, categorized use cases, relational database model, sketches, and screen mockups or screen flows. | Not complete. This project status review is not the required design document. |
| Debugging, profiling, and lifecycle | Screenshots of a breakpoint and variable inspection, a CPU or memory profiler, lifecycle logs, and lifecycle methods triggered in the app. | Evidence not assembled or verified. Add a small demonstrable lifecycle logging example if the current app does not provide clear evidence. |
| Database integration | Show the Firebase/data schema, class organization, GitHub repository, and working create, read, update, and delete operations. | Firebase integration exists, but the full CRUD demonstration and required screenshots still need an end-to-end walkthrough. |
| Functional demonstration | A use-case list and diagram, screenshots, and working end-to-end use cases on a device. | Use cases need to be finalized and each priority path needs device evidence. |
| Non-functional requirements | List the NFRs met and demonstrate usability, performance, availability, maintainability, modifiability, scalability, and resilience to network loss, rotation, and OS termination. | Not verified as a complete test set. Offline and restart tests remain release checks. |
| Final submission | GitHub repository, project presentation, and documentation with references for third-party material. Presentation sections include introduction, problem, objective, solution design, implementation, and system architecture. | The project needs an evidence pack and presentation; cite external logos, images, data, and APIs used. |
## UniApplyForMe comparison and recommended additions

Public UniApplyForMe listings describe study matching, funding discovery, application support, document handling, and prospectus access. CareerCompass already covers several discovery features. The highest-value additions are those that make the application journey reliable:

| Area | Current position | Recommended next step |
|---|---|---|
| APS and course discovery | APS and subject inputs are present. | Keep the first release focused on NSC/APS guidance. Add NCV/TVET paths only after their marks and entry rules are modeled separately. |
| Funding | Funding and NSFAS information exist; a complete eligibility match is not confirmed. | Add an eligibility questionnaire with explicit criteria, official links, and checked dates. Never infer eligibility from incomplete data. |
| Applications | A basic tracker is present; it does not submit applications to institutions. | Add clear tracker states, deadline reminders, a required-document checklist, and official application links. State that submission occurs on the institution's site. |
| Documents | A private application document vault was not confirmed in this pass. | Add storage only with access rules, deletion controls, and secure Firebase Storage rules. Avoid collecting sensitive IDs unless essential. |
| Prospectuses and institution profiles | Prospectus and directory work exists, but coverage is uneven. | Use current official prospectuses and structured campus/programme records with source and checked date. |
| School and funder support | A complete multi-learner dashboard was not confirmed. | Defer until learner consent, data access, and role-based permissions are designed. |

### Recommended delivery sequence

1. Configure and deploy the chatbot Worker, then test it in a fresh preview APK.
2. Fix and retest Google sign-in using the EAS-signed Android fingerprints.
3. Synchronize Firebase content with the mobile app, starting with universities and courses, then complete verified college profiles.
4. Complete offline, guest access, bursary loading, and application tracker acceptance checks.
5. Add data-heavy features such as bursary eligibility matching, secure document storage, and NCV/TVET pathways after the data and access rules are ready.

## Chatbot setup steps

The app is configured to call this project's deployed Worker URL. The Gemini key must come from Google AI Studio; it is separate from the DeepL key used for translation. Never put either key in app source, GitHub, or chat.

1. In Git Bash at the project root, run `cd translation-worker`.
2. Run `npx wrangler secret put GEMINI_API_KEY` and paste the Gemini key only at Wrangler's hidden prompt.
3. Run `npx wrangler deploy` to publish the Worker code.
4. Return to the app root with `cd ..`.
5. Build a new Android preview APK with `npx eas-cli@latest build -p android --profile preview`.
6. Install the new APK and test one online question, then turn off Wi-Fi and test the offline fallback.

If `EXPO_PUBLIC_GEMINI_API_KEY` was previously set in EAS and used in a distributed APK, remove that EAS variable and rotate the Gemini key in Google AI Studio. The current app code no longer reads it.

## Sources

- [Google Gemini API key guidance](https://ai.google.dev/gemini-api/docs/api-key)
- [Gemini 3.8 Flash model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)
- [Cloudflare Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [UniApplyForMe Google Play listing](https://play.google.com/store/apps/details?id=za.org.apply.mobile)
- [UniApplyForMe App Store listing](https://apps.apple.com/us/app/uniapplyforme/id6758760474?platform=vision)

