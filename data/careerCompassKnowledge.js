const APP_OVERVIEW_ANSWER =
  "CareerCompass helps South African learners plan education and career next steps. You can explore universities, colleges, courses, careers, funding, calculate institution-specific admission scores, track applications, and save useful options. It is a planning tool; always confirm current requirements with the institution or funder.";

const OUT_OF_SCOPE =
  "That question is outside CareerCompass. I can help with the app's universities, colleges, courses, careers, APS and marks, funding, applications, profile, and navigation.";

const APS_ANSWER =
  "Open Home or Profile and choose My APS / My Marks. Add your subject marks for a school period to compare them with institution-specific scoring rules. The app's general six-subject estimate gives 7 points for 80–100%, 6 for 70–79%, 5 for 60–69%, 4 for 50–59%, 3 for 40–49%, 2 for 30–39%, and 1 below 30%, usually excluding Life Orientation. Universities can use different rules: for example, NMU uses an Applicant Score, and some methods or course requirements still need verification. Check the course's latest official prospectus; an app match is not an admission offer.";

const ANSWERS = [
  {
    pattern: /\b(hello|hi|hey|good morning|good afternoon|good evening)\b/,
    answer: "Hi! I can help you use CareerCompass. Ask about universities, colleges, courses, careers, APS and marks, funding, applications, your profile, or app navigation.",
  },
  {
    pattern: /\b(what (is|does)|tell me about|describe|about)\b.*\b(careercompass|this app|the app)\b|\b(features|purpose)\b.*\b(app|careercompass)\b/,
    answer: APP_OVERVIEW_ANSWER,
  },
  {
    pattern: /\b(aps|admission point|admission score|applicant score|matric marks|my marks|calculate.*score|score.*calculate)\b/,
    answer: APS_ANSWER,
  },
  {
    pattern: /\b(universit|institution|campus|province)\b/,
    answer: "Open Universities from the bottom navigation to browse institutions. You can search and use the available filters, open an institution for details, save it, and follow its official links. Course lists and requirements can be incomplete or change, so confirm details with the institution.",
  },
  {
    pattern: /\b(college|tvet)\b/,
    answer: "Open the Universities area to browse the institutions and colleges available in CareerCompass. Select a college to see its details and available links. Confirm programmes, entry requirements, campuses, and closing dates on the college's official website.",
  },
  {
    pattern: /\b(course|qualification|programme|program|degree|diploma|study option)\b/,
    answer: "Open Courses from the bottom navigation to browse study options. Select a course to view its institution, available description, listed admission score, subject checks, and prospectus links. Save courses you want to revisit. Listings are guidance and may need verification against the latest official prospectus.",
  },
  {
    pattern: /\b(career|job|occupation|career assessment|career quiz|interests|strengths)\b/,
    answer: "Open Home and choose Career Assessment to answer questions about your interests and study preferences. Review the summary and explore suggested courses. The assessment is for exploration, not a guarantee that a particular career or course is right for you.",
  },
  {
    pattern: /\b(funding|bursar|nsfas|financial aid|student aid|pay for study|tuition)\b/,
    answer: "Open Funding from the bottom navigation to browse available bursary and funding information, including NSFAS details. Open an item for its description and official link. Eligibility, amounts, and deadlines can change; confirm them with the funder. CareerCompass does not submit a funding application for you.",
  },
  {
    pattern: /\b(track|my)\b.*\b(application|applications)\b|\b(application tracker|applied|application status)\b/,
    answer: "Open Profile and choose My Applications. Add an institution and course, then record the date, status, and optional notes. The tracker helps you organise your progress; it does not submit an application to the institution. Use the institution's official application site to apply and check your real status.",
  },
  {
    pattern: /\b(apply|application|closing date|deadline|due date)\b/,
    answer: "CareerCompass can help you find institution information and track an application in My Applications. To apply, follow the institution's official application link and instructions. Check the current closing date and required documents directly with the institution; dates in the app may need confirmation.",
  },
  {
    pattern: /\b(prospectus|prospectuses)\b/,
    answer: "Open Universities, choose an institution, and select its prospectus link on the details page when one is available. If it does not open in the app, use the option to open it in your browser or visit the institution's official website. Check that you have the latest prospectus year.",
  },
  {
    pattern: /\b(bookmark|bookmarks|saved|save|favourite|favorite)\b/,
    answer: "Use the bookmark control on a university, course, or funding item to save it. Open Bookmarks from your profile or the app's quick links to revisit saved items. Tap the bookmark again to remove an item.",
  },
  {
    pattern: /\b(sign up|signup|register|create account|new account)\b/,
    answer: "From the login screen, choose Sign Up and follow the form to create an account. Use an email address you can access and keep your password private. You can also explore guest features where available.",
  },
  {
    pattern: /\b(forgot|reset|recover|change)\b.*\b(password|passcode)\b|\bpassword recovery\b/,
    answer: "On the login screen, choose Password Recovery and enter the email address for your account. Follow the reset link sent to that inbox. Check your spam folder if it does not arrive, and never share your password in chat.",
  },
  {
    pattern: /\b(log in|login|sign in|account access)\b/,
    answer: "Choose Login and enter the email and password linked to your CareerCompass account. If you do not have an account, choose Sign Up. Use Password Recovery if you have forgotten your password.",
  },
  {
    pattern: /\b(profile|personal details|edit details|change name|phone number|profile picture|photo)\b/,
    answer: "Open Profile from the bottom navigation to view your account and learner details. Choose Edit Profile to update supported details or your profile photo. Some account actions require you to be signed in.",
  },
  {
    pattern: /\b(profile screen|my profile|profile page)\b/,
    answer: "Profile is the hub for your learner/account details and shortcuts to bookmarks, My Applications, APS Calculator, universities, courses, notification settings, notifications, language, FAQs, and theme controls. Sign in for features that save or sync account data.",
  },
  {
    pattern: /\b(home screen|home page|home tab)\b/,
    answer: "Home is the dashboard for CareerCompass. Use its quick actions to start career assessment, calculate APS, browse admission matches, and open other planning tools. The bottom navigation takes you to Funding, Universities, Courses, and Profile.",
  },
  {
    pattern: /\b(aps calculator|my aps|my marks|enter marks|add subjects|calculate aps)\b/,
    answer: APS_ANSWER,
  },
  {
    pattern: /\b(theme|dark mode|black theme|light mode|appearance)\b/,
    answer: "Open Profile and find Theme Mode. Choose Light, Dark, or System. Your selection is saved on the device; Dark mode uses the app's dark background and matching surfaces.",
  },
  {
    pattern: /\b(language|translate|translation|afrikaans|isi[zx]ulu|xhosa)\b/,
    answer: "Open Profile or Settings and choose Language to select an available app language. Some content may remain in its original language when a translation is unavailable. Confirm official admission and funding information in the source language on the institution or funder's website.",
  },
  {
    pattern: /\b(notification|notifications|reminder|reminders|alert)\b/,
    answer: "Open Profile and Notification Preferences to review the available notification settings. Application deadline reminders depend on device notification permission and the dates recorded in the app. Check official deadlines yourself as well.",
  },
  {
    pattern: /\b(voice|microphone|read aloud|speak|speech|chat|assistant)\b/,
    answer: "In the CareerCompass Assistant, type a question and tap Send. Use the microphone for voice input or Read aloud below an answer for speech. Voice input needs microphone permission and a supported speech service; read-aloud needs a speech voice enabled on your device or browser. This demo answers app questions from built-in guidance.",
  },
  {
    pattern: /\b(home screen|home page|navigation|navigate|where do i|how do i find|menu|bottom bar)\b/,
    answer: "Use the bottom navigation to open Home, Funding, Universities, Courses, and Profile. Home also has quick actions for tools such as APS, career assessment, and applications. Use Profile for account details, saved items, notifications, language, and theme settings.",
  },
  {
    pattern: /\b(help|what can you do|what can i ask|questions|faq|support)\b/,
    answer: "I can guide you through CareerCompass screens including Home, Universities and institution details, Courses and course details, Funding, APS Calculator and score matches, career assessment and suggestions, applications and the checklist, bookmarks, prospectuses, notifications, FAQs, language, profile, sign-in, and settings. I can also explain common tasks on those screens.",
  },
  {
    pattern: /\b(splash|welcome screen|start screen|onboarding|intro slides|getting started)\b/,
    answer: "The welcome and onboarding screens introduce CareerCompass and help you get started. Follow the slides with Next, or use Skip when available. You can sign in, create an account, or continue as a guest where offered. The career assessment may appear during first setup and can be completed or skipped.",
  },
  {
    pattern: /\b(career assessment welcome|assessment intro|career quiz start|start career assessment)\b/,
    answer: "The Career Assessment welcome screen explains the short questionnaire. Choose Start to answer questions about your interests and study preferences. Your responses are used to suggest career areas and related courses; they are guidance, not a formal aptitude test.",
  },
  {
    pattern: /\b(career assessment results|assessment result|my result|career quiz result)\b/,
    answer: "Career Assessment Results summarises the career area suggested by your answers and offers related ideas. Choose a suggested course category to browse matching courses, or return to the assessment to review your choices. Treat suggestions as a starting point for research.",
  },
  {
    pattern: /\b(course suggestions|suggested courses|recommended courses|assessment courses)\b/,
    answer: "Course Suggestions shows study options related to the category from your Career Assessment. Open a course for its details, check any listed admission score and subject requirements, and verify them in the institution's current prospectus.",
  },
  {
    pattern: /\b(login screen|sign in screen|google sign.?in|guest mode|continue as guest)\b/,
    answer: "On the Login screen, sign in with your account details or use Google sign-in if it is available for your build. Password Recovery opens the reset flow. Guest access may let you explore some features, while saving or syncing personal data can require an account.",
  },
  {
    pattern: /\b(sign.?up screen|registration form|create.*account|register screen)\b/,
    answer: "On Sign Up, enter the requested account details, create a password, and submit the form. Use an email address you can access. If Google sign-up is offered, follow its on-screen prompts. Return to Login if you already have an account.",
  },
  {
    pattern: /\b(password recovery|forgot password|reset password|pass recovery)\b/,
    answer: "On Password Recovery, enter the email linked to your account and submit the request. Follow the reset instructions sent to your inbox, including checking spam if needed. Return to Login after changing your password.",
  },
  {
    pattern: /\b(edit profile|profile editing|update profile|change profile)\b/,
    answer: "Open Profile and choose Edit Profile. Update the fields the form allows, then save your changes. If a field is locked or saving fails, check that you are signed in and that your connection is available.",
  },
  {
    pattern: /\b(university details|university page|institution details|college details|college page)\b/,
    answer: "Open an institution card from Universities to view its details, location, available course or admission information, bookmark control, and official links. Some institutions open a dedicated college page. Use the APS action when shown, and confirm entry requirements and dates with the institution itself.",
  },
  {
    pattern: /\b(course details|course page|qualification details)\b/,
    answer: "Open a course card to see the available description, institution, listed score or subject checks, and any prospectus or official links. Bookmark it if you want to return later. A listed match is only guidance and does not mean you have been admitted.",
  },
  {
    pattern: /\b(funding details|bursary details|scholarship details|funding page)\b/,
    answer: "Open a funding item to read its summary and follow the funder's official link when available. Check eligibility, required documents, award amounts, and closing dates on the funder's current page. CareerCompass helps you discover options but does not submit the funding application.",
  },
  {
    pattern: /\b(aps matches|score matches|university aps scores|admission score matches|aps results)\b/,
    answer: "The admission score matches screen compares your saved score with the institution scoring methods available in the app. Review the score scale and any subject-verification note on each card. Some institutions use different methods or maximums, so use the institution's official course requirements as the final check.",
  },
  {
    pattern: /\b(application guide|application checklist|ready to apply|prepare to apply)\b/,
    answer: "The Application Guide checklist helps you shortlist programmes, check dates and fees, prepare identity and school documents, submit through the official portal, and save your reference. Tap each step as you complete it; progress is saved. Use the tracker to organise applications, but submit on the institution's own site.",
  },
  {
    pattern: /\b(application tracker|my applications|application status|track applications)\b/,
    answer: "My Applications is a personal tracker. Add an institution and programme, then record the application date, status, and notes; update the entry as you hear back. It does not send an application or retrieve live status from the institution, so check the official portal and email too.",
  },
  {
    pattern: /\b(notification settings|notification preferences|notification permission|push notification)\b/,
    answer: "Notification Settings lets you review the available reminder preferences and device permission. If reminders do not arrive, enable CareerCompass notifications in your device settings and check the dates recorded in the app. Keep checking official deadlines independently.",
  },
  {
    pattern: /\b(notifications screen|my notifications|notification inbox|alerts screen)\b/,
    answer: "The Notifications screen lists alerts available to your account. Tap an alert to open its related course, university, funding item, or application area when a destination is provided. A notification is a reminder, so confirm important details at the official source.",
  },
  {
    pattern: /\b(language screen|choose language|change language|translation settings|app language)\b/,
    answer: "Open Profile, then Language, and select an available language from the dropdown. The screen previews translated sample text. Translation coverage depends on the selected language and service; if text stays in English, that content may not have a translation. Confirm official requirements in the source material.",
  },
  {
    pattern: /\b(faq screen|frequently asked questions|faq page|help questions)\b/,
    answer: "The FAQs screen displays expandable questions and answers about planning for university. Tap a question to reveal its answer. If the list is empty, its content may not have loaded; try again with an internet connection or ask me about the app's main features here.",
  },
  {
    pattern: /\b(prospectus screen|open prospectus|view prospectus|pdf viewer|prospectus not opening)\b/,
    answer: "The Prospectus screen opens the institution document when a valid link is available. Use the open-in-browser control if the built-in viewer cannot display it, and check your connection. Prospectus files and links are supplied by institutions; use the latest official edition.",
  },
  {
    pattern: /\b(bookmarks screen|saved items|saved universities|saved courses|saved funding)\b/,
    answer: "Bookmarks collects the universities, courses, and funding items you saved. Select a saved card to reopen its details. Remove a saved item with its bookmark control. If your saved items are missing, confirm you are using the same account or device profile.",
  },
  {
    pattern: /\b(splash screen|loading screen|app stuck loading|app will not open)\b/,
    answer: "The Splash screen appears while CareerCompass starts and checks its local setup. If it remains stuck, close and reopen the app, check your connection, and update to the current build. If it happens repeatedly, note the device and exact error for support.",
  },
];

const normalize = (value) =>
  String(value || "").toLocaleLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

export const careerCompassKnowledge = [APP_OVERVIEW_ANSWER, APS_ANSWER, ...ANSWERS.map(({ answer }) => answer)].join("\n\n");

export function getCareerCompassAppOverviewAnswer(question) {
  const normalized = normalize(question);
  const asksAboutApp =
    /\b(what is|what does|tell me about|describe)\b.*\b(careercompass|this app|the app)\b/.test(normalized) ||
    /\b(careercompass|this app|the app)\b.*\b(about|do|does|features|purpose)\b/.test(normalized);
  return asksAboutApp ? APP_OVERVIEW_ANSWER : null;
}

export function getCareerCompassAppAnswer(question) {
  const normalized = normalize(question);
  if (!normalized) return "Type a question about CareerCompass and I will try to help.";

  const overviewAnswer = getCareerCompassAppOverviewAnswer(normalized);
  if (overviewAnswer) return overviewAnswer;

  // Screen-specific guides are listed after broad feature answers so they win
  // when a question matches both (for example, "application tracker screen").
  const match = [...ANSWERS].reverse().find(({ pattern }) => pattern.test(normalized));
  return match?.answer || OUT_OF_SCOPE;
}

export function getLocalCareerCompassAnswer(question) {
  return getCareerCompassAppAnswer(question);
}

export { OUT_OF_SCOPE };
