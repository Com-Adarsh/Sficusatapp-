export type ProgrammeLevel = "UG" | "PG";

export type AcademicProgramme = {
  id: string;
  level: ProgrammeLevel;
  category: string;
  name: string;
  departmentId: string;
  durationYears: number;
};

export type AcademicDepartment = {
  id: string;
  name: string;
};

export const CUSAT_ADMISSION_CYCLE = "2026";

export const CUSAT_DEPARTMENTS: AcademicDepartment[] = [
  { id: "applied-chemistry", name: "Department of Applied Chemistry" },
  { id: "applied-economics", name: "Department of Applied Economics" },
  { id: "atmospheric-sciences", name: "Department of Atmospheric Sciences" },
  { id: "biotechnology", name: "Department of Biotechnology" },
  { id: "chemical-oceanography", name: "Department of Chemical Oceanography" },
  { id: "computer-applications", name: "Department of Computer Applications" },
  { id: "computer-science", name: "Department of Computer Science" },
  { id: "electronics", name: "Department of Electronics" },
  { id: "hindi", name: "Department of Hindi" },
  { id: "instrumentation", name: "Department of Instrumentation" },
  { id: "marine-biology-microbiology-biochemistry", name: "Department of Marine Biology, Microbiology and Biochemistry" },
  { id: "marine-geology-geophysics", name: "Department of Marine Geology and Geophysics" },
  { id: "mathematics", name: "Department of Mathematics" },
  { id: "physical-oceanography", name: "Department of Physical Oceanography" },
  { id: "physics", name: "Department of Physics" },
  { id: "polymer-science-rubber-technology", name: "Department of Polymer Science and Rubber Technology" },
  { id: "ship-technology", name: "Department of Ship Technology" },
  { id: "statistics", name: "Department of Statistics" },
  { id: "school-of-engineering", name: "School of Engineering" },
  { id: "school-of-environmental-studies", name: "School of Environmental Studies" },
  { id: "school-of-industrial-fisheries", name: "School of Industrial Fisheries" },
  { id: "school-of-legal-studies", name: "School of Legal Studies" },
  { id: "school-of-management-studies", name: "School of Management Studies" },
  { id: "international-school-of-photonics", name: "International School of Photonics" },
  { id: "kunjali-markkar-marine-engineering", name: "Kunjali Markkar School of Marine Engineering" },
  { id: "cochin-university-college-engineering-kuttanad", name: "Cochin University College of Engineering, Kuttanad" },
  { id: "centre-for-budget-studies", name: "Centre for Budget Studies" },
  { id: "centre-for-integrated-studies", name: "Centre for Integrated Studies" },
  { id: "centre-research-ethics-protocols", name: "Prof NR Madhava Menon Interdisciplinary Centre for Research Ethics and Protocols" },
  { id: "ddu-kaushal-kendra", name: "DDU Kaushal Kendra" },
  { id: "iuciprs", name: "IUCIPRS" },
  { id: "ncaah", name: "NCAAH" },
];

export const CUSAT_PROGRAMMES: AcademicProgramme[] = [
  // UG · B.Tech
  { id: "btech-civil-cucek", level: "UG", category: "B.Tech Programmes", name: "B.Tech Civil Engineering", departmentId: "cochin-university-college-engineering-kuttanad", durationYears: 4 },
  { id: "btech-it-cucek", level: "UG", category: "B.Tech Programmes", name: "B.Tech Information Technology", departmentId: "cochin-university-college-engineering-kuttanad", durationYears: 4 },
  { id: "btech-cse-cucek", level: "UG", category: "B.Tech Programmes", name: "B.Tech Computer Science & Engineering", departmentId: "cochin-university-college-engineering-kuttanad", durationYears: 4 },
  { id: "btech-eee-cucek", level: "UG", category: "B.Tech Programmes", name: "B.Tech Electrical & Electronics Engineering", departmentId: "cochin-university-college-engineering-kuttanad", durationYears: 4 },
  { id: "btech-ece-cucek", level: "UG", category: "B.Tech Programmes", name: "B.Tech Electronics & Communication Engineering", departmentId: "cochin-university-college-engineering-kuttanad", durationYears: 4 },
  { id: "btech-instrumentation-control", level: "UG", category: "B.Tech Programmes", name: "B.Tech Instrumentation and Control Engineering", departmentId: "instrumentation", durationYears: 4 },
  { id: "btech-polymer-science", level: "UG", category: "B.Tech Programmes", name: "B.Tech Polymer Science & Engineering", departmentId: "polymer-science-rubber-technology", durationYears: 4 },
  { id: "btech-naval-architecture", level: "UG", category: "B.Tech Programmes", name: "B.Tech Naval Architecture & Ship Building", departmentId: "ship-technology", durationYears: 4 },
  { id: "btech-marine-engineering", level: "UG", category: "B.Tech Programmes", name: "B.Tech Marine Engineering", departmentId: "kunjali-markkar-marine-engineering", durationYears: 4 },
  { id: "btech-eee-soe", level: "UG", category: "B.Tech Programmes", name: "B.Tech Electrical & Electronics Engineering", departmentId: "school-of-engineering", durationYears: 4 },
  { id: "btech-ece-soe", level: "UG", category: "B.Tech Programmes", name: "B.Tech Electronics & Communication Engineering", departmentId: "school-of-engineering", durationYears: 4 },
  { id: "btech-civil-soe", level: "UG", category: "B.Tech Programmes", name: "B.Tech Civil Engineering", departmentId: "school-of-engineering", durationYears: 4 },
  { id: "btech-it-soe", level: "UG", category: "B.Tech Programmes", name: "B.Tech Information Technology", departmentId: "school-of-engineering", durationYears: 4 },
  { id: "btech-cse-soe", level: "UG", category: "B.Tech Programmes", name: "B.Tech Computer Science & Engineering", departmentId: "school-of-engineering", durationYears: 4 },
  { id: "btech-mechanical-soe", level: "UG", category: "B.Tech Programmes", name: "B.Tech Mechanical Engineering", departmentId: "school-of-engineering", durationYears: 4 },
  { id: "btech-safety-fire", level: "UG", category: "B.Tech Programmes", name: "B.Tech Safety & Fire Engineering", departmentId: "school-of-engineering", durationYears: 4 },
  { id: "btech-ai-data-science", level: "UG", category: "B.Tech Programmes", name: "B.Tech Artificial Intelligence and Data Science", departmentId: "school-of-engineering", durationYears: 4 },

  // UG · B.Tech Part Time
  { id: "btech-civil-part-time", level: "UG", category: "BTech Part Time Programmes", name: "B.Tech Civil Engineering (Part Time)", departmentId: "school-of-engineering", durationYears: 3.5 },
  { id: "btech-mechanical-part-time", level: "UG", category: "BTech Part Time Programmes", name: "B.Tech Mechanical Engineering (Part Time)", departmentId: "school-of-engineering", durationYears: 3.5 },

  // UG · Integrated
  { id: "integrated-mca", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "5-year Integrated MCA", departmentId: "computer-applications", durationYears: 5 },
  { id: "integrated-mest-stream1", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five Year Integrated M.Sc in Environmental Science and Technology - Stream 1", departmentId: "school-of-environmental-studies", durationYears: 5 },
  { id: "integrated-mest-stream2", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five Year Integrated M.Sc in Environmental Science and Technology - Stream 2", departmentId: "school-of-environmental-studies", durationYears: 5 },
  { id: "integrated-econometrics-data-science", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five Year Integrated M.Sc. in Econometrics and Data Science", departmentId: "centre-for-budget-studies", durationYears: 5 },
  { id: "integrated-hindi", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five Year Integrated MA with Major in Hindi Language and Literature", departmentId: "hindi", durationYears: 5 },
  { id: "integrated-chemistry", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five- Year Integrated M.Sc. in Chemistry", departmentId: "applied-chemistry", durationYears: 5 },
  { id: "integrated-cs-ai-ds", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five- Year Integrated M.Sc. in Computer Science (Artificial Intelligence & Data Science)", departmentId: "computer-science", durationYears: 5 },
  { id: "integrated-mathematics", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five- Year Integrated M.Sc. in Mathematics", departmentId: "mathematics", durationYears: 5 },
  { id: "integrated-photonics", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five- Year Integrated M.Sc. in Photonics", departmentId: "international-school-of-photonics", durationYears: 5 },
  { id: "integrated-physics", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five- Year Integrated M.Sc. in Physics", departmentId: "physics", durationYears: 5 },
  { id: "integrated-statistics", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five- Year Integrated M.Sc. in Statistics", departmentId: "statistics", durationYears: 5 },
  { id: "integrated-biological-sciences", level: "UG", category: "Integrated MSc/MCA/MA Programmes", name: "Five-Year Integrated M.Sc. in Biological Sciences", departmentId: "biotechnology", durationYears: 5 },

  // UG · Integrated lateral entry
  { id: "lateral-integrated-mest-sem3", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc in Environmental Science and Technology (Lateral Entry, 3rd Semester)", departmentId: "school-of-environmental-studies", durationYears: 5 },
  { id: "lateral-integrated-biological-sem3", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Biological Sciences (Lateral Entry, 3rd Semester)", departmentId: "biotechnology", durationYears: 5 },
  { id: "lateral-integrated-biological-sem5", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Biological Sciences (Lateral Entry, 5th Semester)", departmentId: "biotechnology", durationYears: 5 },
  { id: "lateral-integrated-chemistry-sem3", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Chemistry (Lateral Entry, 3rd Semester)", departmentId: "applied-chemistry", durationYears: 5 },
  { id: "lateral-integrated-chemistry-sem5", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Chemistry (Lateral Entry, 5th Semester)", departmentId: "applied-chemistry", durationYears: 5 },
  { id: "lateral-integrated-mathematics-sem3", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Mathematics (Lateral Entry, 3rd Semester)", departmentId: "mathematics", durationYears: 5 },
  { id: "lateral-integrated-mathematics-sem5", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Mathematics (Lateral Entry, 5th Semester)", departmentId: "mathematics", durationYears: 5 },
  { id: "lateral-integrated-photonics-sem3", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Photonics (Lateral Entry, 3rd Semester)", departmentId: "international-school-of-photonics", durationYears: 5 },
  { id: "lateral-integrated-photonics-sem5", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Photonics (Lateral Entry, 5th Semester)", departmentId: "international-school-of-photonics", durationYears: 5 },
  { id: "lateral-integrated-physics-sem3", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Physics (Lateral Entry, 3rd Semester)", departmentId: "physics", durationYears: 5 },
  { id: "lateral-integrated-physics-sem5", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Physics (Lateral Entry, 5th Semester)", departmentId: "physics", durationYears: 5 },
  { id: "lateral-integrated-statistics-sem3", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Statistics (Lateral Entry, 3rd Semester)", departmentId: "statistics", durationYears: 5 },
  { id: "lateral-integrated-statistics-sem5", level: "UG", category: "Integrated Programmes (Lateral Entry)", name: "Five-Year Integrated M.Sc. in Statistics (Lateral Entry, 5th Semester)", departmentId: "statistics", durationYears: 5 },

  // UG · Law
  { id: "bba-llb-h", level: "UG", category: "UG Law Programmes", name: "Five Year BBA LLB (H)", departmentId: "school-of-legal-studies", durationYears: 5 },
  { id: "bcom-llb-h", level: "UG", category: "UG Law Programmes", name: "Five Year Bcom LLB (H)", departmentId: "school-of-legal-studies", durationYears: 5 },
  { id: "bsc-llb-h-computer-science", level: "UG", category: "UG Law Programmes", name: "Five Year B.Sc LL.B(Hons.) (Computer Science)", departmentId: "centre-research-ethics-protocols", durationYears: 5 },

  // UG · Other
  { id: "b-voc-data-science-analytics", level: "UG", category: "Other UG Programmes", name: "B.Voc (Honours) in Data Science and Analytics", departmentId: "ddu-kaushal-kendra", durationYears: 4 },
  { id: "btech-lateral-entry", level: "UG", category: "Other UG Programmes", name: "B.Tech Lateral Entry", departmentId: "school-of-engineering", durationYears: 3 },

  // PG · MA
  { id: "ma-applied-economics", level: "PG", category: "MA Programmes", name: "MA Applied Economics", departmentId: "applied-economics", durationYears: 2 },
  { id: "ma-hindi-language-literature", level: "PG", category: "MA Programmes", name: "MA Hindi Language And Literature", departmentId: "hindi", durationYears: 2 },

  // PG · MSc / MFSc
  { id: "msc-econometrics-financial-technology", level: "PG", category: "MSc Programmes", name: "MSc in Econometrics and Financial Technology", departmentId: "centre-for-budget-studies", durationYears: 2 },
  { id: "msc-forensic-science", level: "PG", category: "MSc Programmes", name: "MSc Forensic Science", departmentId: "centre-for-integrated-studies", durationYears: 2 },
  { id: "msc-chemistry", level: "PG", category: "MSc Programmes", name: "MSc Chemistry", departmentId: "applied-chemistry", durationYears: 2 },
  { id: "msc-meteorology", level: "PG", category: "MSc Programmes", name: "MSc Meteorology", departmentId: "atmospheric-sciences", durationYears: 2 },
  { id: "msc-biotechnology", level: "PG", category: "MSc Programmes", name: "MSc Biotechnology", departmentId: "biotechnology", durationYears: 2 },
  { id: "msc-microbiology", level: "PG", category: "MSc Programmes", name: "MSc Microbiology", departmentId: "biotechnology", durationYears: 2 },
  { id: "msc-hydrochemistry", level: "PG", category: "MSc Programmes", name: "MSc Hydrochemistry", departmentId: "chemical-oceanography", durationYears: 2 },
  { id: "msc-cs-ai", level: "PG", category: "MSc Programmes", name: "MSc Computer Science With Specialization In Artificial Intelligence", departmentId: "computer-applications", durationYears: 2 },
  { id: "msc-cs-data-science", level: "PG", category: "MSc Programmes", name: "MSc. Computer Science With Specialization In Data Science", departmentId: "computer-applications", durationYears: 2 },
  { id: "msc-electronic-science", level: "PG", category: "MSc Programmes", name: "MSc Electronic Science", departmentId: "electronics", durationYears: 2 },
  { id: "msc-marine-biology", level: "PG", category: "MSc Programmes", name: "MSc Marine Biology", departmentId: "marine-biology-microbiology-biochemistry", durationYears: 2 },
  { id: "msc-marine-genomics", level: "PG", category: "MSc Programmes", name: "M.Sc in Marine Genomics", departmentId: "marine-biology-microbiology-biochemistry", durationYears: 2 },
  { id: "msc-marine-geophysics", level: "PG", category: "MSc Programmes", name: "MSc Marine Geophysics", departmentId: "marine-geology-geophysics", durationYears: 2 },
  { id: "msc-marine-geology", level: "PG", category: "MSc Programmes", name: "MSc Marine Geology", departmentId: "marine-geology-geophysics", durationYears: 2 },
  { id: "msc-mathematics", level: "PG", category: "MSc Programmes", name: "MSc Mathematics", departmentId: "mathematics", durationYears: 2 },
  { id: "msc-oceanography", level: "PG", category: "MSc Programmes", name: "MSc Oceanography", departmentId: "physical-oceanography", durationYears: 2 },
  { id: "msc-physics", level: "PG", category: "MSc Programmes", name: "MSc Physics", departmentId: "physics", durationYears: 2 },
  { id: "msc-statistics", level: "PG", category: "MSc Programmes", name: "MSc Statistics", departmentId: "statistics", durationYears: 2 },
  { id: "msc-environmental-science-stream1", level: "PG", category: "MSc Programmes", name: "MSc Environmental Science and Technology - Stream 1", departmentId: "school-of-environmental-studies", durationYears: 2 },
  { id: "msc-environmental-science-stream2", level: "PG", category: "MSc Programmes", name: "MSc Environmental Science and Technology - Stream 2", departmentId: "school-of-environmental-studies", durationYears: 2 },
  { id: "msc-industrial-fisheries", level: "PG", category: "MSc Programmes", name: "MSc Industrial Fisheries", departmentId: "school-of-industrial-fisheries", durationYears: 2 },
  { id: "mfsc-seafood-safety-trade", level: "PG", category: "MSc Programmes", name: "MFSc Sea Food Safety And Trade", departmentId: "school-of-industrial-fisheries", durationYears: 2 },

  // PG · MCA
  { id: "mca-regular-cucek", level: "PG", category: "MCA Programmes", name: "Master of Computer Applications (Regular)", departmentId: "cochin-university-college-engineering-kuttanad", durationYears: 2 },
  { id: "mca-cost-sharing-cucek", level: "PG", category: "MCA Programmes", name: "Master of Computer Applications (Cost Sharing)", departmentId: "cochin-university-college-engineering-kuttanad", durationYears: 2 },
  { id: "mca-regular-dca", level: "PG", category: "MCA Programmes", name: "Master of Computer Applications (Regular)", departmentId: "computer-applications", durationYears: 2 },
  { id: "mca-cost-sharing-dca", level: "PG", category: "MCA Programmes", name: "Master of Computer Applications (Cost Sharing)", departmentId: "computer-applications", durationYears: 2 },

  // PG · Law
  { id: "llm-ipr", level: "PG", category: "PG LAW Programmes", name: "Two Year LLM (IPR)", departmentId: "iuciprs", durationYears: 2 },
  { id: "llm-ipr-phd", level: "PG", category: "PG LAW Programmes", name: "LLM (IPR) PhD", departmentId: "iuciprs", durationYears: 5 },
  { id: "ms-ipr-phd", level: "PG", category: "PG LAW Programmes", name: "MS (IPR) PhD", departmentId: "iuciprs", durationYears: 5 },
  { id: "llm-two-year", level: "PG", category: "PG LAW Programmes", name: "LL.M. (Two year)", departmentId: "school-of-legal-studies", durationYears: 2 },

  // PG · Other
  { id: "mvoc-software-application-development", level: "PG", category: "Other PG Programmes", name: "M.Voc Programme in Software Application Development", departmentId: "ddu-kaushal-kendra", durationYears: 2 },
  { id: "mvoc-banking-finance", level: "PG", category: "Other PG Programmes", name: "M.Voc. programme in Banking and Finance", departmentId: "ddu-kaushal-kendra", durationYears: 2 },
  { id: "msc-bioethics", level: "PG", category: "Other PG Programmes", name: "M.Sc Bioethics", departmentId: "centre-research-ethics-protocols", durationYears: 2 },

  // PG · MBA
  { id: "mba-full-time", level: "PG", category: "MBA Programmes", name: "MBA Full Time", departmentId: "school-of-management-studies", durationYears: 2 },
  { id: "mba-evening-regular", level: "PG", category: "MBA Programmes", name: "MBA Evening-Regular", departmentId: "school-of-management-studies", durationYears: 3 },
  { id: "mba-executive", level: "PG", category: "MBA Programmes", name: "MBA EXECUTIVE", departmentId: "school-of-management-studies", durationYears: 2 },
  { id: "international-dual-masters-management", level: "PG", category: "MBA Programmes", name: "International Dual Masters Programme in Management", departmentId: "school-of-management-studies", durationYears: 2 },

  // PG · M.Tech / Dual MS
  { id: "mtech-cse-executive", level: "PG", category: "M.Tech Programmes", name: "MTech in Computer Science and Engineering (Executive)", departmentId: "computer-applications", durationYears: 2 },
  { id: "mtech-cse-ds-ai", level: "PG", category: "M.Tech Programmes", name: "M.Tech. in Computer Science and Engineering with specialization in Data Science & Artificial Intelligence", departmentId: "computer-science", durationYears: 2 },
  { id: "mtech-cse-ai-software", level: "PG", category: "M.Tech Programmes", name: "M.Tech Computer Science and Engineering (Artificial Intelligence and Software Engineering)", departmentId: "computer-science", durationYears: 2 },
  { id: "mtech-vlsi-embedded", level: "PG", category: "M.Tech Programmes", name: "M.Tech in VLSI and Embedded Systems", departmentId: "electronics", durationYears: 2 },
  { id: "mtech-electronic-instrumentation-control", level: "PG", category: "M.Tech Programmes", name: "M.Tech. in Electronic Instrumentation and Control Engineering", departmentId: "instrumentation", durationYears: 2 },
  { id: "mtech-casad", level: "PG", category: "M.Tech Programmes", name: "M.Tech. in Computer Aided Structural Analysis and Design", departmentId: "ship-technology", durationYears: 2 },
  { id: "mtech-optoelectronics-laser", level: "PG", category: "M.Tech Programmes", name: "M.Tech. in Opto-Electronics and Laser Technology", departmentId: "international-school-of-photonics", durationYears: 2 },
  { id: "mtech-marine-biotechnology", level: "PG", category: "M.Tech Programmes", name: "M.Tech in Marine Biotechnology", departmentId: "ncaah", durationYears: 2 },
  { id: "mtech-synthetic-biology", level: "PG", category: "M.Tech Programmes", name: "M.Tech Programme in Synthetic Biology and Biomanufacturing", departmentId: "ncaah", durationYears: 2 },
  { id: "mtech-polymer-technology", level: "PG", category: "M.Tech Programmes", name: "M.Tech. in Polymer Technology", departmentId: "polymer-science-rubber-technology", durationYears: 2 },
  { id: "mtech-geotechnical", level: "PG", category: "M.Tech Programmes", name: "M.Tech programme in Geotechnical Engineering", departmentId: "school-of-engineering", durationYears: 2 },
  { id: "mtech-industrial-safety", level: "PG", category: "M.Tech Programmes", name: "M.Tech in Industrial Safety", departmentId: "school-of-engineering", durationYears: 2 },
  { id: "mtech-structural-engineering", level: "PG", category: "M.Tech Programmes", name: "M.Tech programme in Structural Engineering", departmentId: "school-of-engineering", durationYears: 2 },
  { id: "mtech-it-business-analytics", level: "PG", category: "M.Tech Programmes", name: "M.Tech in Information Technology (Business Analytics and Intelligence)", departmentId: "school-of-engineering", durationYears: 2 },
  { id: "mtech-cse-cyber-security", level: "PG", category: "M.Tech Programmes", name: "M.Tech in Computer Science and Engineering (Cyber Security)", departmentId: "school-of-engineering", durationYears: 2 },
  { id: "dual-ms-electronic-component", level: "PG", category: "M.Tech Programmes", name: "Dual Masters in Science (MS) in New Generation of Electronic Component Base", departmentId: "school-of-engineering", durationYears: 2 },
];

export const CUSAT_DEPARTMENT_BY_ID = Object.fromEntries(
  CUSAT_DEPARTMENTS.map((department) => [department.id, department]),
) as Record<string, AcademicDepartment>;

export function programmesForDepartment(departmentId: string) {
  return CUSAT_PROGRAMMES.filter((programme) => programme.departmentId === departmentId);
}

export function programmesForLevel(level: ProgrammeLevel) {
  return CUSAT_PROGRAMMES.filter((programme) => programme.level === level);
}
