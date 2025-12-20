export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
  description?: string;
}

export interface VolunteeringItem {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  link: string;
  startDate?: string;
  endDate?: string;
}

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github?: string;
  website: string;
  showProfilePicture: boolean;
  profilePicture?: string;
  showSummary: boolean;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  volunteering: VolunteeringItem[];
  certifications: string[];
  skills: string[]; // Stored as comma separated string in UI, parsed array in type if needed, but simple array of strings is best
  languages: string[];
  projects: ProjectItem[];
  sectionLayout: string[][]; // Array of pages, where each page is an array of section IDs
}

export enum SectionType {
  PERSONAL = 'PERSONAL',
  SUMMARY = 'SUMMARY',
  EXPERIENCE = 'EXPERIENCE',
  EDUCATION = 'EDUCATION',
  CERTIFICATIONS = 'CERTIFICATIONS',
  SKILLS = 'SKILLS',
  PROJECTS = 'PROJECTS'
}