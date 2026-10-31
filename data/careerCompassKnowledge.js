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
    answer: "I can answer common questions about CareerCompass: finding universities and courses, using My Marks and APS estimates, exploring careers, checking funding, tracking applications, using bookmarks and prospectuses, managing your profile, and changing settings. Ask me about one of those features.",
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

  const match = ANSWERS.find(({ pattern }) => pattern.test(normalized));
  return match?.answer || OUT_OF_SCOPE;
}

export function getLocalCareerCompassAnswer(question) {
  return getCareerCompassAppAnswer(question);
}

export { OUT_OF_SCOPE };
