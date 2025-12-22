
import { ResumeData } from './types';

export const INITIAL_RESUME_STATE: ResumeData = {
  personalInfo: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    showProfilePicture: false,
    showSummary: true
  },
  summary: '',
  experience: [],
  education: [],
  internship: [],
  volunteering: [],
  certifications: [],
  skills: [],
  languages: [],
  projects: [],
  publications: [],
  sectionLayout: [
    ['summary', 'experience', 'education', 'internship', 'projects', 'publications', 'volunteering', 'certifications', 'skills', 'languages']
  ]
};
