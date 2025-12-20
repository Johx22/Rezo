import { ResumeData } from './types';

export const INITIAL_RESUME_STATE: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    title: 'Senior Product Designer',
    email: 'alex.morgan@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexmorgan',
    github: 'github.com/alexmorgan',
    website: 'alexmorgan.design',
    showProfilePicture: false,
    showSummary: true
  },
  summary: 'Creative and detail-oriented Product Designer with over 6 years of experience in building user-centric digital products. Proven track record of improving user engagement and streamlining complex workflows. Passionate about accessibility and design systems.',
  experience: [
    {
      id: '1',
      company: 'TechFlow Solutions',
      position: 'Senior UX Designer',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description: '<ul><li>Led the redesign of the core SaaS platform, resulting in a 25% increase in user retention.</li><li>Mentored junior designers and established a unified design system used across 4 product lines.</li><li>Collaborated closely with engineering and product management to define product roadmap.</li></ul>'
    },
    {
      id: '2',
      company: 'Creative Pulse Agency',
      position: 'UI/UX Designer',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description: '<ul><li>Designed responsive websites and mobile apps for diverse clients in fintech and healthcare.</li><li>Conducted user research and usability testing to validate design decisions.</li><li>Worked in an agile environment with rapid iteration cycles.</li></ul>'
    }
  ],
  education: [
    {
      id: '1',
      school: 'California College of the Arts',
      degree: 'Bachelor of Fine Arts',
      field: 'Interaction Design',
      graduationDate: '2018-05',
      description: '<ul><li>Graduated with Honors (Cum Laude).</li><li>Focus on Human-Computer Interaction and Visual Design.</li><li>President of the Design Students Association.</li></ul>'
    }
  ],
  internship: [],
  volunteering: [
    {
        id: '1',
        organization: 'Design for Good',
        role: 'Volunteer Mentor',
        startDate: '2019-01',
        endDate: '',
        current: true,
        location: 'San Francisco, CA',
        description: 'Mentoring aspiring designers from underrepresented backgrounds. conducting portfolio reviews and career guidance sessions.'
    }
  ],
  certifications: [
    'Google UX Design Professional Certificate (2022)',
    'Certified Scrum Master (CSM) - Scrum Alliance (2020)'
  ],
  skills: [
    'Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'HTML/CSS', 'Agile Methodology', 'Design Systems'
  ],
  languages: [
    'English (Native)',
    'Spanish (Professional Working Proficiency)'
  ],
  projects: [
    {
      id: '1',
      name: 'EcoTrack Mobile App',
      description: 'A personal carbon footprint tracking application designed to help users make sustainable lifestyle choices.',
      link: 'github.com/alexmorgan/ecotrack',
      startDate: '2022-01',
      endDate: '2022-04'
    }
  ],
  sectionLayout: [
    ['summary', 'experience', 'education', 'internship', 'projects', 'volunteering', 'certifications', 'skills', 'languages']
  ]
};