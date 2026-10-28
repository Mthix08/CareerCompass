export const careerCompassKnowledge = `
CareerCompass is a mobile application designed to help students explore
universities, courses, careers, and funding opportunities.

CareerCompass allows users to navigate through the application and access
information related to education and career planning.

Main CareerCompass features include:

1. Home
The Home screen is the main landing area of the application.

2. Universities
The Universities section allows users to explore university and institution
information.

3. Funding
CareerCompass is intended to provide information about funding and bursary
opportunities for students.

4. Profile
The Profile area allows registered users to manage their profile information.

5. Login
Users can log into CareerCompass using their account credentials.

6. Sign Up
New users can create a CareerCompass account.

7. Password Recovery
Users can recover their password if they have forgotten it.

8. Career information
CareerCompass is designed to help students explore career-related information
and make informed educational decisions.
`;

const OUT_OF_SCOPE =
  "I'm the CareerCompass Assistant. I can only help you with questions about CareerCompass and its features.";

const APP_OVERVIEW_ANSWER =
  "CareerCompass is a career and study-planning app for South African learners. It helps you calculate your APS, explore universities, colleges and courses, connect study options to careers, take a career assessment, find funding information, and track applications. Always confirm current admission and funding requirements with the official institution or funder.";

export function getCareerCompassAppOverviewAnswer(question) {
  const normalizedQuestion = normalize(question);
  const asksWhatTheAppIs =
    /\bwhat(?: is|s) (this|the) app(?:(?: is)? (about|for))?\b/.test(normalizedQuestion) ||
    /\bwhat does (this|the) app do\b/.test(normalizedQuestion) ||
    /\btell me about (careercompass|this app|the app)\b/.test(normalizedQuestion) ||
    /\bwhat(?: is|s) careercompass(?:(?: is)? about)?\b/.test(normalizedQuestion) ||
    /\bwhat does careercompass do\b/.test(normalizedQuestion) ||
    /\bdescribe (careercompass|this app|the app)\b/.test(normalizedQuestion);

  return asksWhatTheAppIs ? APP_OVERVIEW_ANSWER : null;
}

const responses = [
  {
    words: ["careercompass"],
    answer:
      "CareerCompass is a mobile app that helps students explore universities, courses, careers, and funding opportunities.",
  },
  {
    words: ["home"],
    answer:
      "Home is the main landing area of CareerCompass. From there you can use quick actions to explore courses, universities, funding, and your APS information.",
  },
  {
    words: ["universit", "institution", "campus"],
    answer:
      "Open Universities from the bottom navigation to search institutions, filter by province, view application information, and save universities.",
  },
  {
    words: ["course", "study", "programme", "program"],
    answer:
      "Open Courses from the bottom navigation to browse courses. Select a course to view its details and save it for later.",
  },
  {
    words: ["funding", "bursar", "nsfas", "money", "financial"],
    answer:
      "CareerCompass provides funding and bursary information, including the NSFAS details area. Open Funding from Home to review the available information.",
  },
  {
    words: ["profile", "account", "name", "personal"],
    answer:
      "Open Profile from the bottom navigation to view or manage your CareerCompass profile information and account settings.",
  },
  {
    words: ["login", "log in", "sign in"],
    answer:
      "Use Login to access your CareerCompass account. If you do not have an account yet, choose Sign Up instead.",
  },
  {
    words: ["sign up", "register", "create account"],
    answer:
      "Choose Sign Up on the login screen and follow the prompts to create a CareerCompass account.",
  },
  {
    words: ["password", "forgot", "recover"],
    answer:
      "Choose Password Recovery on the login screen if you have forgotten your password, then follow the recovery instructions.",
  },
  {
    words: ["career", "job", "work"],
    answer:
      "CareerCompass is designed to help you explore career information and make informed education decisions. Course details can help you compare possible paths.",
  },
  {
    words: ["hello", "hi", "hey", "help"],
    answer:
      "Hello. I can help with CareerCompass navigation, universities, courses, careers, funding, accounts, login, sign up, and password recovery.",
  },
];

const normalize = (value) =>
  value.toLocaleLowerCase().replace(/[^a-z0-9 ]/g, " ");

export function getLocalCareerCompassAnswer(question) {
  const overviewAnswer = getCareerCompassAppOverviewAnswer(question);
  if (overviewAnswer) return overviewAnswer;

  const normalizedQuestion = normalize(question);
  const match = responses.find(({ words }) =>
    words.some((word) => normalizedQuestion.includes(normalize(word))),
  );

  return match?.answer || OUT_OF_SCOPE;
}

export { OUT_OF_SCOPE };
