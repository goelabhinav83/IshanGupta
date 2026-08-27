export const doctor = {
  name: "Dr. Ishan Gupta",
  credentials: "MBBS, DNB (Respiratory Diseases)",
  specialty: "Pulmonology & Respiratory Medicine",
  hospital: "Apollo Hospitals, New Delhi",
  experienceYears: 10,
  languages: ["English", "Hindi", "Punjabi"],
  tagline: "Pulmonology & Respiratory Medicine Specialist, Apollo Hospitals",
  photo: "/images/dr-ishan-gupta.jpg",
} as const;

export const bio = [
  `Dr. Ishan Gupta is a dedicated and experienced Pulmonology & Respiratory Medicine specialist based in New Delhi. With over 10 years of expertise in the field, Dr. Gupta has established a reputation for providing high-quality care and treatment to patients with respiratory conditions. He is a graduate of MBBS and holds a DNB in Respiratory Diseases, equipping him with the knowledge and skills necessary to diagnose and manage a wide range of pulmonary issues including asthma, COPD, tuberculosis, sarcoidosis, pneumonia, and lung fibrosis (ILD).`,
  `He has expertise in all pulmonary procedures including bronchoscopy, EBUS, thoracocentesis, and lung biopsy, along with all critical care procedures. He holds a special interest in sleep apnea and has presented talks on the subject at national conferences. He is a skilled critical care expert and handles ICU patients and those requiring ventilation.`,
  `Fluent in English, Hindi, and Punjabi, Dr. Gupta is committed to communicating effectively with his patients, ensuring they fully understand their conditions and treatment options. At Apollo Hospitals, he employs a patient-centric approach, focusing on personalized treatment plans that lead to optimal health outcomes. Dr. Gupta is known for his compassionate demeanor, taking the time to listen to his patients' concerns and providing the support they need throughout their treatment journey.`,
];

export const conditionsTreated = [
  "Asthma",
  "COPD",
  "Tuberculosis",
  "Sarcoidosis",
  "Pneumonia",
  "Lung fibrosis (ILD)",
];

export const procedures = [
  "Bronchoscopy",
  "EBUS",
  "Thoracocentesis",
  "Lung biopsy",
  "Critical care / ICU & ventilator management",
];

export const specialInterest = {
  title: "Sleep Apnea",
  description:
    "Dr. Gupta holds a special interest in sleep apnea and has spoken at national conferences and on CNBC Awaaz on sleep hygiene.",
};

export type Publication = {
  title: string;
  authors?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year?: string;
};

export const publications: Publication[] = [
  {
    title:
      "Disseminated Histoplasmosis in a patient with Rheumatoid Arthritis and Interstitial Lungs",
  },
  {
    title: "Sarcoidosis: An Unusual Case of Pleural Effusion",
    journal: "Medical Science, India",
    volume: "9",
    issue: "10",
    pages: "1736–1737",
    year: "December 2020",
  },
  {
    title:
      "Post-trauma Deep-Seated Cutaneous Mucormycosis with Secondary Bacterial Infection and Multiorgan Failure in a Diabetic Patient",
    journal: "International Journal of Scientific Research",
    volume: "9",
    issue: "12",
    year: "December 2020",
  },
  {
    title:
      "Antidepressant-induced Acute Respiratory Distress Syndrome: Unraveling Sertraline's Role in Acute Lung Injury",
    authors: "Ahlawat A, Modi N, Gupta I.",
    journal: "Indian J Chest Dis Allied Sci",
    year: "2026",
  },
];

export const awards = [
  "APJ Abdul Kalam Award for Service Excellence in Pulmonology, on Doctor's Day",
];

export const memberships = [
  "Member, Indian Chest Society",
  "Member, European Respiratory Society",
  "Member, Chest Journal",
];

export const speakingEngagements = [
  'Speaker, NCCP Meet — "Solitary Pulmonary Nodule"',
  "Speaker, CNBC Awaaz — Sleep Hygiene",
  "Speaker at multiple national conferences",
];

export const contact = {
  whatsappNumber: "918076674364",
  whatsappDisplay: "+91 80766 74364",
  email: "dr.ishangupta90@gmail.com",
  clinicName: "Cure Chest Clinic",
  addressLines: ["SCO 71, Sector 28", "HUDA Market, Faridabad, Haryana"],
  fullAddress: "Cure Chest Clinic, SCO 71, Sector 28, HUDA Market, Faridabad, Haryana",
  officeHours: "Monday – Saturday, 5 PM – 8 PM",
} as const;

export const whatsappPrefilledMessage =
  "Hi Dr. Gupta, I'd like to request an appointment.";

export const navLinks = [
  { href: "#about", label: "About" },
  { href: "#expertise", label: "Expertise" },
  { href: "#publications", label: "Publications" },
  { href: "#awards", label: "Awards" },
  { href: "#contact", label: "Contact" },
] as const;
