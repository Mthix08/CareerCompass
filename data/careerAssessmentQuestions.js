export const ASSESSMENT_VERSION = 1;

export const INTEREST_CATEGORIES = {
  technology_computing: "Technology and Computing",
  business_management: "Business and Entrepreneurship",
  engineering_construction: "Engineering and Construction",
  health_sciences: "Health and Healthcare",
  science_research: "Science and Research",
  law_social_sciences: "Law and Social Sciences",
  education: "Education and Teaching",
  art_design_creativity: "Art, Design and Creativity",
  communication_media: "Communication and Media",
  environment_agriculture: "Environment and Agriculture",
};

const fields = Object.entries(INTEREST_CATEGORIES).map(([id, label]) => ({ id, label, categories: [id] }));
const question = (id, category, text, type, labels, opts = {}) => ({
  id, category, text, helperText: opts.helperText || "", selectionType: type,
  required: opts.required !== false,
  options: labels.map((item, index) => typeof item === "string"
    ? { id: `${id}_${index + 1}`, label: item, categories: [], signals: [] }
    : item),
});
const mapped = (label, categories = [], signals = []) => ({ label, categories, signals });

export const CAREER_ASSESSMENT_QUESTIONS = [
  question("interests_fields", "Interests", "Which fields interest you the most?", "multi", fields),
  question("interests_activity", "Interests", "Which activity would you find most enjoyable?", "single", [
    mapped("Building an application or website.", ["technology_computing"]), mapped("Managing a business or developing a business idea.", ["business_management"]), mapped("Designing a building, machine, or technical system.", ["engineering_construction"]), mapped("Helping people improve their health and well-being.", ["health_sciences"]), mapped("Conducting experiments and investigating scientific questions.", ["science_research"]), mapped("Understanding laws, society, and human behaviour.", ["law_social_sciences"]), mapped("Teaching someone a new skill.", ["education"]), mapped("Creating visual designs, illustrations, or digital content.", ["art_design_creativity", "communication_media"]),
  ]),
  question("interests_learning", "Interests", "What would you most enjoy learning about?", "single", [
    mapped("How software, computers, and digital systems work.", ["technology_computing"]), mapped("How organisations operate and make business decisions.", ["business_management"]), mapped("How machines, structures, and engineering systems work.", ["engineering_construction"]), mapped("How the human body and healthcare systems work.", ["health_sciences"]), mapped("How scientific discoveries are made.", ["science_research"]), mapped("How people, communities, laws, and societies work.", ["law_social_sciences"]), mapped("How people learn and develop new skills.", ["education"]), mapped("How design, art, and communication influence people.", ["art_design_creativity", "communication_media"]),
  ]),
  question("strengths", "Strengths and Problem-Solving", "Which skills do you consider some of your strengths?", "multi", [
    mapped("Logical and analytical thinking.", [], ["analytical_thinking"]), mapped("Creativity and generating new ideas.", [], ["creativity"]), mapped("Communication and explaining ideas.", [], ["communication"]), mapped("Leadership and organising people.", [], ["leadership"]), mapped("Working collaboratively with others.", [], ["collaboration"]), mapped("Practical and hands-on problem-solving.", [], ["practical_problem_solving"]), mapped("Researching and investigating information.", [], ["research"]), mapped("Attention to detail and accuracy.", [], ["attention_to_detail"]),
  ]),
  question("problem_approach", "Strengths and Problem-Solving", "When you face a difficult problem, which approach sounds most like you?", "single", [
    mapped("Break it into smaller parts and solve it logically.", [], ["analytical_thinking"]), mapped("Research the problem and examine the available evidence.", [], ["research"]), mapped("Experiment with different ideas until something works.", [], ["creativity", "practical_problem_solving"]), mapped("Discuss it with others and collaborate on a solution.", [], ["collaboration", "communication"]), mapped("Organise a plan and work through it step by step.", [], ["leadership", "attention_to_detail"]),
  ]),
  question("task_preference", "Strengths and Problem-Solving", "Which type of task would you enjoy most?", "single", [
    mapped("Analysing data or solving technical problems.", ["technology_computing", "science_research"], ["analytical_thinking"]), mapped("Creating something original or visually appealing.", ["art_design_creativity"], ["creativity"]), mapped("Explaining information or helping someone understand it.", ["education", "communication_media"], ["communication"]), mapped("Planning projects and coordinating activities.", ["business_management"], ["leadership"]), mapped("Investigating a question and discovering new information.", ["science_research"], ["research"]), mapped("Building, repairing, or improving something practical.", ["engineering_construction"], ["practical_problem_solving"]),
  ]),
  question("mathematics", "Academic and Learning Preferences", "How do you generally feel about Mathematics?", "single", [
    mapped("I really enjoy Mathematics.", [], ["mathematics_positive"]), mapped("I am comfortable with Mathematics.", [], ["mathematics_comfortable"]), mapped("I can manage Mathematics, but it is not my favourite subject.", [], ["mathematics_neutral"]), mapped("I find Mathematics challenging.", [], ["mathematics_challenging"]), mapped("I strongly prefer subjects with less mathematical work.", [], ["prefers_less_mathematics"]), mapped("I am studying Mathematical Literacy rather than Mathematics.", [], ["mathematical_literacy"]),
  ], { helperText: "This is a preference only and does not determine academic eligibility." }),
  question("school_subjects", "Academic and Learning Preferences", "Which school subjects do you enjoy or feel most interested in?", "multi", [
    mapped("Mathematics", [], ["mathematics_positive"]), mapped("Mathematical Literacy", [], ["mathematical_literacy"]), mapped("Physical Sciences", ["science_research", "engineering_construction"], ["enjoys_physical_sciences"]), mapped("Life Sciences", ["health_sciences", "science_research"], ["enjoys_life_sciences"]), mapped("Accounting", ["business_management"], ["enjoys_accounting"]), mapped("Business Studies", ["business_management"]), mapped("Economics", ["business_management", "law_social_sciences"]), mapped("Information Technology", ["technology_computing"], ["enjoys_information_technology"]), mapped("Computer Applications Technology", ["technology_computing"], ["enjoys_information_technology"]), mapped("Geography", ["environment_agriculture", "science_research"]), mapped("History", ["law_social_sciences"]), mapped("Languages", ["communication_media", "education"]), mapped("Visual Arts or Design", ["art_design_creativity"]), mapped("Agricultural Sciences", ["environment_agriculture"]), mapped("Other subjects", []),
  ]),
  question("learning_approach", "Academic and Learning Preferences", "Which learning approach suits you best?", "single", ["Practical projects and hands-on activities.", "Solving mathematical or logical problems.", "Reading, researching, and analysing information.", "Discussing ideas and working with people.", "Designing, creating, and experimenting.", "A balanced combination of these approaches."].map((label, i) => mapped(label, [], [["practical_problem_solving"], ["analytical_thinking"], ["research"], ["communication", "collaboration"], ["creativity"], []][i]))),
  question("environment", "Work Preferences", "Which working environment appeals to you most?", "single", [mapped("A technology-focused or software development environment.", ["technology_computing"]), mapped("A business or corporate environment.", ["business_management"]), mapped("An engineering workshop or technical environment.", ["engineering_construction"]), mapped("A healthcare or clinical environment.", ["health_sciences"]), mapped("A laboratory or research environment.", ["science_research"]), mapped("A school or educational environment.", ["education"]), mapped("A creative studio or media environment.", ["art_design_creativity", "communication_media"]), mapped("A community-focused or people-oriented environment.", ["law_social_sciences", "health_sciences"]), mapped("An outdoor or environmental working environment.", ["environment_agriculture"]), mapped("I am not sure yet.")]),
  question("work_with", "Work Preferences", "What would you most enjoy working with?", "single", [mapped("Computers, software, and technology.", ["technology_computing"]), mapped("Numbers, data, and financial information.", ["business_management", "science_research"]), mapped("Machines, equipment, and physical systems.", ["engineering_construction"]), mapped("People and their needs.", ["health_sciences", "education", "law_social_sciences"]), mapped("Scientific information and research.", ["science_research"]), mapped("Visual designs, creative ideas, and media.", ["art_design_creativity", "communication_media"]), mapped("Business operations and organisational processes.", ["business_management"]), mapped("A combination of different areas.")]),
  question("career_values", "Work Preferences", "What matters most to you in a future career?", "single", ["Solving interesting problems.", "Helping people and making a positive difference.", "Financial stability and career opportunities.", "Creativity and expressing new ideas.", "Leadership and taking responsibility.", "Continuous learning and developing new skills.", "Flexibility and different possible career paths.", "I am still figuring out what matters most to me."].map((label, i) => mapped(label, [], [["analytical_thinking"], ["communication"], ["business_management"], ["creativity"], ["leadership"], ["research"], [], []][i]))),
  question("career_clarity", "Career Direction", "How clear are you about the career you want to pursue?", "single", ["I already have a specific career in mind.", "I have a few careers I am considering.", "I know which fields interest me, but not a specific career.", "I am still exploring and would appreciate guidance."]),
  question("qualification_type", "Career Direction", "Which type of qualification are you considering after matric?", "single", ["Bachelor's degree.", "Diploma.", "Higher certificate.", "I am open to different qualification types.", "I am not sure yet."]),
  question("excluded_fields", "Career Direction", "Are there any fields you already know you are not interested in?", "multi", [...fields, { id: "open_any_field", label: "I am open to exploring any field.", categories: [], signals: [], exclusive: true }], { required: false, helperText: "You can leave this blank if you are open to exploring." }),
];

export function hasAnswered(questionItem, answers) {
  const value = answers[questionItem.id];
  return questionItem.selectionType === "multi" ? Array.isArray(value) && value.length > 0 : Boolean(value);
}
