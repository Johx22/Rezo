import React, { useState, useRef, useEffect } from 'react';
import { ResumeData, ExperienceItem, EducationItem, ProjectItem, VolunteeringItem, InternshipItem } from '../types';
import { Plus, Trash2, Wand2, ChevronRight, ChevronLeft, ArrowRight, User, Briefcase, GraduationCap, Lightbulb, Rocket, Upload, Eye, Award, Share2, Download, Printer, ZoomIn, ZoomOut, RotateCcw, HelpCircle, X, Hand, LayoutTemplate, ArrowUp, ArrowDown, FilePlus, FileMinus, Move, Building, FileJson } from 'lucide-react';
import { enhanceDescription, generateResumeSummary, suggestSkills } from '../services/geminiService';
import { Preview } from './Preview';
import { RichTextEditor } from './RichTextEditor';
import { AnimatePresence, motion, Variants } from 'framer-motion';

interface EditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  resumeName: string;
}

type SectionKey = 'personal' | 'experience' | 'education' | 'internship' | 'certifications' | 'skills' | 'projects' | 'export' | 'layout';

const SECTIONS: { key: SectionKey; label: string; icon: any; description: string }[] = [
  { 
    key: 'personal', 
    label: 'Personal', 
    icon: User,
    description: "Provide essential information about yourself."
  },
  { 
    key: 'experience', 
    label: 'Experience', 
    icon: Briefcase,
    description: "Showcase your professional journey."
  },
  { 
    key: 'education', 
    label: 'Education', 
    icon: GraduationCap,
    description: "List your academic background."
  },
  { 
    key: 'internship', 
    label: 'Internship', 
    icon: Building,
    description: "Detail your internship experiences."
  },
  { 
    key: 'certifications', 
    label: 'Certs', 
    icon: Award,
    description: "List additional qualifications."
  },
  { 
    key: 'skills', 
    label: 'Skills', 
    icon: Lightbulb,
    description: "Highlight your technical and soft skills."
  },
  { 
    key: 'projects', 
    label: 'Projects', 
    icon: Rocket,
    description: "Show off specific projects."
  },
  {
    key: 'layout',
    label: 'Layout',
    icon: LayoutTemplate,
    description: "Organize your resume across multiple pages."
  },
  { 
    key: 'export', 
    label: 'Export', 
    icon: Share2,
    description: "Export your resume as PDF."
  },
];

const SECTION_LABELS: Record<string, string> = {
    summary: 'Professional Summary',
    experience: 'Work History',
    education: 'Education',
    internship: 'Internships',
    volunteering: 'Volunteering',
    certifications: 'Certifications',
    skills: 'Skills',
    languages: 'Languages',
    projects: 'Projects'
};

const pageVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 25 : -25,
    filter: 'blur(2px)'
  }),
  animate: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 }
    }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 25 : -25,
    filter: 'blur(2px)',
    transition: {
        duration: 0.2,
        ease: "easeInOut"
    }
  })
};

// Helper to convert plain text from AI to basic HTML for the editor
const convertPlainTextToHtml = (text: string) => {
    if (!text) return '';
    if (text.includes('<ul>') || text.includes('<li>') || text.includes('<b>')) return text;

    const lines = text.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            const content = trimmed.replace(/^[•\-*]\s*/, '');
            html += `<li>${content}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += `<div>${trimmed}</div>`;
        }
    });

    if (inList) html += '</ul>';
    if (!html && text) return `<div>${text}</div>`;
    return html;
};

export const Editor: React.FC<EditorProps> = ({ data, onChange, resumeName }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('personal');
  const [direction, setDirection] = useState(0);
  const [loadingSection, setLoadingSection] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(0.45);
  const [showPhotoAdvice, setShowPhotoAdvice] = useState(false);
  const [isHandMode, setIsHandMode] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  // Panning State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  useEffect(() => {
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSection]);

  const changeSection = (key: SectionKey) => {
    const currentIdx = SECTIONS.findIndex(s => s.key === activeSection);
    const newIdx = SECTIONS.findIndex(s => s.key === key);
    setDirection(newIdx > currentIdx ? 1 : -1);
    setActiveSection(key);
  };

  // --- Drag / Pan Handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isHandMode || !previewContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - previewContainerRef.current.offsetLeft;
    startY.current = e.pageY - previewContainerRef.current.offsetTop;
    scrollLeft.current = previewContainerRef.current.scrollLeft;
    scrollTop.current = previewContainerRef.current.scrollTop;
    previewContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (previewContainerRef.current && isHandMode) {
         previewContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (previewContainerRef.current && isHandMode) {
        previewContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !isHandMode || !previewContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - previewContainerRef.current.offsetLeft;
    const y = e.pageY - previewContainerRef.current.offsetTop;
    const walkX = (x - startX.current) * 1.5; 
    const walkY = (y - startY.current) * 1.5;
    previewContainerRef.current.scrollLeft = scrollLeft.current - walkX;
    previewContainerRef.current.scrollTop = scrollTop.current - walkY;
  };

  // --- Update Helpers ---
  const updatePersonal = (field: string, value: any) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonal('profilePicture', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    onChange({
      ...data,
      experience: data.experience.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experience: data.experience.filter(item => item.id !== id) });
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    onChange({
      ...data,
      education: data.education.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      graduationDate: ''
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(item => item.id !== id) });
  };

  const updateInternship = (id: string, field: keyof InternshipItem, value: any) => {
    const currentInternships = data.internship || [];
    onChange({
      ...data,
      internship: currentInternships.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const addInternship = () => {
    const newInternship: InternshipItem = {
      id: Date.now().toString(),
      designation: '',
      organization: '',
      startDate: '',
      endDate: '',
      location: '',
      keySkills: '',
      description: ''
    };
    onChange({ ...data, internship: [...(data.internship || []), newInternship] });
  };

  const removeInternship = (id: string) => {
    onChange({ ...data, internship: (data.internship || []).filter(item => item.id !== id) });
  };

  const updateVolunteering = (id: string, field: keyof VolunteeringItem, value: any) => {
    const currentVol = data.volunteering || [];
    onChange({
      ...data,
      volunteering: currentVol.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const addVolunteering = () => {
    const newVol: VolunteeringItem = {
      id: Date.now().toString(),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      location: '',
      description: ''
    };
    onChange({ ...data, volunteering: [...(data.volunteering || []), newVol] });
  };

  const removeVolunteering = (id: string) => {
    onChange({ ...data, volunteering: (data.volunteering || []).filter(item => item.id !== id) });
  };

  const addCertification = () => {
    const newCerts = [...(data.certifications || []), ''];
    onChange({ ...data, certifications: newCerts });
  };

  const updateCertification = (index: number, value: string) => {
    const newCerts = [...(data.certifications || [])];
    newCerts[index] = value;
    onChange({ ...data, certifications: newCerts });
  };

  const removeCertification = (index: number) => {
    const newCerts = [...(data.certifications || [])];
    newCerts.splice(index, 1);
    onChange({ ...data, certifications: newCerts });
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skills = e.target.value.split(',').map(s => s.trim());
    onChange({ ...data, skills });
  };

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const languages = e.target.value.split(',').map(s => s.trim());
    onChange({ ...data, languages });
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: string) => {
     onChange({
        ...data,
        projects: data.projects.map(item => item.id === id ? { ...item, [field]: value} : item)
     });
  };

  const addProject = () => {
     const newProj: ProjectItem = {
        id: Date.now().toString(),
        name: '',
        description: '',
        link: '',
        startDate: '',
        endDate: ''
     };
     onChange({ ...data, projects: [...data.projects, newProj]});
  };

  const removeProject = (id: string) => {
    onChange({ ...data, projects: data.projects.filter(item => item.id !== id)});
  };

  // --- Layout Management ---
  const handleAddPage = () => {
      onChange({
          ...data,
          sectionLayout: [...data.sectionLayout, []]
      });
  };

  const handleRemovePage = (pageIndex: number) => {
      const layout = [...data.sectionLayout];
      const sectionsToMove = layout[pageIndex];
      // Move orphaned sections to the previous page (or first page if no prev)
      const targetPageIndex = pageIndex > 0 ? pageIndex - 1 : 0;
      if (layout.length > 1) {
          layout[targetPageIndex] = [...layout[targetPageIndex], ...sectionsToMove];
          layout.splice(pageIndex, 1);
          onChange({ ...data, sectionLayout: layout });
      }
  };

  const handleMoveSection = (section: string, fromPage: number, toPage: number) => {
      const layout = data.sectionLayout.map(page => [...page]);
      
      // Remove from old page
      layout[fromPage] = layout[fromPage].filter(s => s !== section);
      
      // Add to new page
      layout[toPage] = [...layout[toPage], section];
      
      onChange({ ...data, sectionLayout: layout });
  };

  const handleReorderSection = (section: string, pageIndex: number, direction: 'up' | 'down') => {
      const layout = data.sectionLayout.map(page => [...page]);
      const page = layout[pageIndex];
      const currentIndex = page.indexOf(section);
      
      if (direction === 'up' && currentIndex > 0) {
          [page[currentIndex], page[currentIndex - 1]] = [page[currentIndex - 1], page[currentIndex]];
      } else if (direction === 'down' && currentIndex < page.length - 1) {
          [page[currentIndex], page[currentIndex + 1]] = [page[currentIndex + 1], page[currentIndex]];
      }
      
      onChange({ ...data, sectionLayout: layout });
  };

  const handleZoomIn = () => {
      setPreviewScale(prev => Math.min(prev + 0.05, 1.2));
  };
  const handleZoomOut = () => {
      setPreviewScale(prev => Math.max(prev - 0.05, 0.25));
  };
  const handleZoomReset = () => {
      setPreviewScale(0.45);
  };

  // Unified Print Handler for both "Download PDF" and "Print" buttons
  const triggerPrint = () => {
    const originalTitle = document.title;
    document.title = resumeName; // Set title so the PDF filename is correct
    window.print();
    setTimeout(() => {
        document.title = originalTitle; // Revert title
    }, 500);
  };

  // JSON Export Handler
  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeName || 'resume'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateSummary = async () => {
    setLoadingSection('summary');
    try {
      const summary = await generateResumeSummary(data);
      onChange({ ...data, summary });
    } catch (e) {
      alert("Failed to generate summary. Please check your API key.");
    } finally {
      setLoadingSection(null);
    }
  };

  const handleEnhanceDescription = async (id: string, text: string, title: string) => {
    setLoadingSection(`exp-${id}`);
    try {
      const enhancedText = await enhanceDescription(text, title);
      const enhancedHtml = convertPlainTextToHtml(enhancedText);
      updateExperience(id, 'description', enhancedHtml);
    } catch (e) {
      alert("Failed to enhance description.");
    } finally {
      setLoadingSection(null);
    }
  };
  
  const handleEnhanceInternshipDescription = async (id: string, text: string, title: string) => {
    setLoadingSection(`int-${id}`);
    try {
      const enhancedText = await enhanceDescription(text, title);
      const enhancedHtml = convertPlainTextToHtml(enhancedText);
      updateInternship(id, 'description', enhancedHtml);
    } catch (e) {
      alert("Failed to enhance description.");
    } finally {
      setLoadingSection(null);
    }
  };

  const handleSuggestSkills = async () => {
    setLoadingSection('skills');
    try {
      const newSkills = await suggestSkills(data.personalInfo.title, data.skills);
      const uniqueSkills = Array.from(new Set([...data.skills, ...newSkills])).filter(Boolean);
      onChange({ ...data, skills: uniqueSkills });
    } catch (e) {
        alert("Failed to suggest skills.");
    } finally {
        setLoadingSection(null);
    }
  };

  const goToNext = () => {
    const currentIndex = SECTIONS.findIndex(s => s.key === activeSection);
    if (currentIndex < SECTIONS.length - 1) {
      changeSection(SECTIONS[currentIndex + 1].key);
    }
  };

  const goToPrev = () => {
    const currentIndex = SECTIONS.findIndex(s => s.key === activeSection);
    if (currentIndex > 0) {
      changeSection(SECTIONS[currentIndex - 1].key);
    }
  };

  const currentIndex = SECTIONS.findIndex(s => s.key === activeSection);
  const prevSection = currentIndex > 0 ? SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex < SECTIONS.length - 1 ? SECTIONS[currentIndex + 1] : null;

  const currentSectionInfo = SECTIONS.find(s => s.key === activeSection);

  // Shared classes for consistent styling - LIGHT & DARK MODE
  const inputClass = "w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors duration-200";
  const textAreaClass = "w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none resize-y text-sm leading-relaxed placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors duration-200";
  const cardClass = "bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg relative group transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700";

  return (
    <div className="h-full flex flex-col bg-transparent relative">
      
      {/* Tab Navigation */}
      <div className="bg-white/95 dark:bg-slate-950/80 backdrop-blur text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md z-20 shrink-0 transition-colors duration-300">
        <div className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex min-w-full w-fit justify-center px-4">
            {SECTIONS.map((section, index) => {
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  onClick={() => changeSection(section.key)}
                  className={`
                    flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2
                    ${isActive 
                      ? 'text-blue-600 dark:text-white border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-slate-900/50' 
                      : 'border-transparent hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/30'}
                  `}
                >
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors
                    ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500'}
                  `}>
                    {index + 1}
                  </div>
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full overflow-y-auto custom-scrollbar" ref={scrollContainerRef}>
          <div className="max-w-7xl mx-auto p-6 flex items-start gap-8 justify-center">
            
            {/* Left Column: Form Editor */}
            <div className="flex-1 max-w-3xl pb-20 overflow-x-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeSection}
                  custom={direction}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Header for the current section */}
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{currentSectionInfo?.label}</h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium text-sm mt-1 transition-colors">
                      {currentSectionInfo?.description}
                    </p>
                  </div>

                  {/* PERSONAL */}
                  {activeSection === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Configuration Toggles */}
                      <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center transition-colors">
                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={data.personalInfo.showSummary}
                                    onChange={(e) => updatePersonal('showSummary', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 select-none">Add a Summary</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={data.personalInfo.showProfilePicture}
                                    onChange={(e) => updatePersonal('showProfilePicture', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300 select-none">Include Photo</span>
                            </label>
                            <button onClick={() => setShowPhotoAdvice(true)} className="text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors" title="Should I include a photo?">
                                <HelpCircle size={16} />
                            </button>
                        </div>
                      </div>

                      {/* Summary Input */}
                      {data.personalInfo.showSummary && (
                        <div className="col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-top-2 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400">Summary Text</label>
                                <button onClick={handleGenerateSummary} disabled={loadingSection === 'summary'} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
                                    <Wand2 size={12} />
                                    {loadingSection === 'summary' ? 'Writing...' : 'AI Generate'}
                                </button>
                            </div>
                            <textarea 
                                value={data.summary} 
                                onChange={(e) => onChange({ ...data, summary: e.target.value })} 
                                rows={4} 
                                className={textAreaClass}
                                placeholder="Briefly describe your professional background and key achievements..." 
                            />
                        </div>
                      )}

                      {/* Profile Picture Upload */}
                      {data.personalInfo.showProfilePicture && (
                        <div className="col-span-2 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                            {data.personalInfo.profilePicture ? (
                                <div className="relative group">
                                    <img src={data.personalInfo.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-md mb-3" />
                                    <button onClick={() => updatePersonal('profilePicture', undefined)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                    <User size={32} className="text-slate-400 dark:text-slate-600" />
                                </div>
                            )}
                            <label className="cursor-pointer bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm shadow-sm">
                                <Upload size={16} />
                                Upload Photo
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            <p className="text-xs text-slate-500 mt-2">Recommended: Square JPG or PNG, max 1MB</p>
                        </div>
                      )}

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Full Name</label>
                        <input type="text" value={data.personalInfo.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Professional Title</label>
                        <input type="text" value={data.personalInfo.title} onChange={(e) => updatePersonal('title', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Email</label>
                        <input type="email" value={data.personalInfo.email} onChange={(e) => updatePersonal('email', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Phone</label>
                        <input type="text" value={data.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Location</label>
                        <input type="text" value={data.personalInfo.location} onChange={(e) => updatePersonal('location', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">LinkedIn</label>
                        <input type="text" value={data.personalInfo.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">GitHub</label>
                        <input type="text" value={data.personalInfo.github || ''} onChange={(e) => updatePersonal('github', e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-1.5">Website</label>
                        <input type="text" value={data.personalInfo.website} onChange={(e) => updatePersonal('website', e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}

                  {/* EXPERIENCE */}
                  {activeSection === 'experience' && (
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                        {data.experience.map((exp) => (
                          <motion.div 
                            key={exp.id} 
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.2 }}
                            className={cardClass}
                          >
                          <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="col-span-2 md:col-span-1">
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase mb-1">Position</label>
                                  <input type="text" value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} className={inputClass} />
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase mb-1">Company</label>
                                  <input type="text" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase mb-1">Start Date</label>
                                  <input type="text" placeholder="YYYY-MM" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase mb-1">End Date</label>
                                  <div className="flex gap-2 items-center">
                                      <input type="text" placeholder="YYYY-MM" value={exp.endDate} disabled={exp.current} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} className={`w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors`} />
                                      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200">
                                          <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                          Present
                                      </label>
                                  </div>
                              </div>
                          </div>
                          <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                  <label className="block text-xs font-semibold text-slate-500 uppercase">Description</label>
                                  <button onClick={() => handleEnhanceDescription(exp.id, exp.description, exp.position)} disabled={loadingSection === `exp-${exp.id}` || !exp.description} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
                                      <Wand2 size={12} />
                                      {loadingSection === `exp-${exp.id}` ? 'Enhancing...' : 'Enhance with AI'}
                                  </button>
                              </div>
                              <RichTextEditor 
                                  value={exp.description} 
                                  onChange={(val) => updateExperience(exp.id, 'description', val)} 
                                  placeholder="• Achievements and responsibilities..." 
                              />
                          </div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                      <button onClick={addExperience} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold">
                          <Plus size={18} /> Add Position
                      </button>
                    </div>
                  )}

                  {/* EDUCATION & VOLUNTEERING */}
                  {activeSection === 'education' && (
                    <div className="space-y-6">
                    {/* Education Items */}
                    <AnimatePresence mode="popLayout">
                    {data.education.map((edu) => (
                        <motion.div 
                          key={edu.id} 
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                          transition={{ duration: 0.2 }}
                          className={cardClass}
                        >
                            <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">School / University</label>
                                    <input type="text" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} className={inputClass} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Degree</label>
                                        <input type="text" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Field of Study</label>
                                        <input type="text" value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Graduation Date</label>
                                    <input type="text" placeholder="YYYY-MM" value={edu.graduationDate} onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description / Achievements</label>
                                    <RichTextEditor 
                                        value={edu.description || ''} 
                                        onChange={(val) => updateEducation(edu.id, 'description', val)} 
                                        placeholder="GPA, Awards, Relevant Coursework..." 
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                    <button onClick={addEducation} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold">
                        <Plus size={18} /> Add Education
                    </button>

                    {/* Volunteering Section */}
                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Volunteering Experience</h3>
                            <p className="text-sm text-slate-500">Share your community involvement and volunteer work.</p>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                            {(data.volunteering || []).map((vol) => (
                                <motion.div 
                                    key={vol.id} 
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.2 }}
                                    className={cardClass}
                                >
                                    <button onClick={() => removeVolunteering(vol.id)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Organization Name</label>
                                            <input type="text" value={vol.organization} onChange={(e) => updateVolunteering(vol.id, 'organization', e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title / Role</label>
                                            <input type="text" value={vol.role} onChange={(e) => updateVolunteering(vol.id, 'role', e.target.value)} className={inputClass} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Location</label>
                                            <input type="text" value={vol.location} onChange={(e) => updateVolunteering(vol.id, 'location', e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                                            <input type="text" placeholder="YYYY-MM" value={vol.startDate} onChange={(e) => updateVolunteering(vol.id, 'startDate', e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="text" placeholder="YYYY-MM" value={vol.endDate} disabled={vol.current} onChange={(e) => updateVolunteering(vol.id, 'endDate', e.target.value)} className={`w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 transition-colors`} />
                                                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200">
                                                    <input type="checkbox" checked={vol.current} onChange={(e) => updateVolunteering(vol.id, 'current', e.target.checked)} className="rounded border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                                    Present
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description & Achievements</label>
                                        <RichTextEditor 
                                            value={vol.description} 
                                            onChange={(val) => updateVolunteering(vol.id, 'description', val)} 
                                            placeholder="Describe your responsibilities and impact..." 
                                        />
                                    </div>
                                </motion.div>
                            ))}
                            </AnimatePresence>
                            <button onClick={addVolunteering} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold">
                                <Plus size={18} /> Add Volunteering Experience
                            </button>
                        </div>
                    </div>
                  </div>
                  )}

                  {/* INTERNSHIP */}
                  {activeSection === 'internship' && (
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                      {(data.internship || []).map((int) => (
                          <motion.div 
                              key={int.id} 
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                              transition={{ duration: 0.2 }}
                              className={cardClass}
                          >
                              <button onClick={() => removeInternship(int.id)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="col-span-2 md:col-span-1">
                                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Designation</label>
                                      <input type="text" value={int.designation} onChange={(e) => updateInternship(int.id, 'designation', e.target.value)} className={inputClass} />
                                  </div>
                                  <div className="col-span-2 md:col-span-1">
                                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Organization</label>
                                      <input type="text" value={int.organization} onChange={(e) => updateInternship(int.id, 'organization', e.target.value)} className={inputClass} />
                                  </div>
                                  <div className="col-span-2">
                                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Location</label>
                                      <input type="text" value={int.location} onChange={(e) => updateInternship(int.id, 'location', e.target.value)} className={inputClass} />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date</label>
                                      <input type="text" placeholder="YYYY-MM" value={int.startDate} onChange={(e) => updateInternship(int.id, 'startDate', e.target.value)} className={inputClass} />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date</label>
                                      <input type="text" placeholder="YYYY-MM" value={int.endDate} onChange={(e) => updateInternship(int.id, 'endDate', e.target.value)} className={inputClass} />
                                  </div>
                                  <div className="col-span-2">
                                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Key Skills</label>
                                      <input type="text" placeholder="e.g. Java, SQL, Testing (Comma separated)" value={int.keySkills} onChange={(e) => updateInternship(int.id, 'keySkills', e.target.value)} className={inputClass} />
                                  </div>
                              </div>
                              <div className="mt-4">
                                  <div className="flex justify-between items-center mb-2">
                                      <label className="block text-xs font-semibold text-slate-500 uppercase">Description</label>
                                      <button onClick={() => handleEnhanceInternshipDescription(int.id, int.description, int.designation)} disabled={loadingSection === `int-${int.id}` || !int.description} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
                                          <Wand2 size={12} />
                                          {loadingSection === `int-${int.id}` ? 'Enhancing...' : 'Enhance with AI'}
                                      </button>
                                  </div>
                                  <RichTextEditor 
                                      value={int.description} 
                                      onChange={(val) => updateInternship(int.id, 'description', val)} 
                                      placeholder="Describe your internship responsibilities..." 
                                  />
                              </div>
                          </motion.div>
                      ))}
                      </AnimatePresence>
                      <button onClick={addInternship} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold">
                          <Plus size={18} /> Add Internship
                      </button>
                    </div>
                  )}

                  {/* CERTIFICATIONS */}
                  {activeSection === 'certifications' && (
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                      {(data.certifications || []).map((cert, index) => (
                          <motion.div 
                            key={index} 
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.2 }}
                            className="flex gap-3 items-center"
                          >
                              <input 
                                type="text" 
                                value={cert} 
                                onChange={(e) => updateCertification(index, e.target.value)}
                                placeholder="e.g. Certified Scrum Master (CSM) - 2023" 
                                className={inputClass} 
                              />
                              <button onClick={() => removeCertification(index)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors p-2">
                                <Trash2 size={18} />
                              </button>
                          </motion.div>
                      ))}
                      </AnimatePresence>
                      <button onClick={addCertification} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold">
                          <Plus size={18} /> Add Certification
                      </button>
                    </div>
                  )}

                  {/* SKILLS */}
                  {activeSection === 'skills' && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Skills List</label>
                            <button onClick={handleSuggestSkills} disabled={loadingSection === 'skills' || !data.personalInfo.title} className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                                <Wand2 size={16} />
                                {loadingSection === 'skills' ? 'Analyzing...' : 'Suggest Skills with AI'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Separate skills with commas (e.g. React, Python, Leadership)</p>
                        <textarea value={data.skills.join(', ')} onChange={handleSkillsChange} rows={8} className={textAreaClass} placeholder="Start typing your skills..." />
                      </div>

                      {/* Languages Section */}
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Languages</label>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Separate languages with commas (e.g. English, French, Mandarin)</p>
                        <textarea value={(data.languages || []).join(', ')} onChange={handleLanguagesChange} rows={4} className={textAreaClass} placeholder="e.g. English (Native), Spanish (B2)" />
                      </div>
                    </div>
                  )}
                  
                  {/* PROJECTS */}
                  {activeSection === 'projects' && (
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                      {data.projects.map((proj) => (
                          <motion.div 
                            key={proj.id} 
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.2 }}
                            className={cardClass}
                          >
                            <button onClick={() => removeProject(proj.id)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Project Name</label>
                                    <input type="text" value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} className={inputClass} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Link (Optional)</label>
                                    <input type="text" value={proj.link} onChange={(e) => updateProject(proj.id, 'link', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Start Date (Optional)</label>
                                    <input type="text" placeholder="YYYY-MM" value={proj.startDate || ''} onChange={(e) => updateProject(proj.id, 'startDate', e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">End Date (Optional)</label>
                                    <input type="text" placeholder="YYYY-MM" value={proj.endDate || ''} onChange={(e) => updateProject(proj.id, 'endDate', e.target.value)} className={inputClass} />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                                    <RichTextEditor 
                                        value={proj.description} 
                                        onChange={(val) => updateProject(proj.id, 'description', val)} 
                                        placeholder="Describe the project..."
                                    />
                                </div>
                            </div>
                          </motion.div>
                      ))}
                      </AnimatePresence>
                      <button onClick={addProject} className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-semibold">
                          <Plus size={18} /> Add Project
                      </button>
                    </div>
                  )}

                  {/* LAYOUT MANAGER */}
                  {activeSection === 'layout' && (
                      <div className="space-y-6">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
                              <p className="font-semibold mb-1">Manage Pages & Sections</p>
                              <p>Organize your content across pages. Dragging is not supported yet, please use the arrows to move sections.</p>
                          </div>

                          <AnimatePresence>
                          {(data.sectionLayout || []).map((pageSections, pageIndex) => (
                              <motion.div 
                                key={`page-${pageIndex}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-inner"
                              >
                                  <div className="flex justify-between items-center mb-3">
                                      <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                          <div className="w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xs shadow-sm border border-slate-200 dark:border-slate-700">
                                              {pageIndex + 1}
                                          </div>
                                          Page {pageIndex + 1}
                                      </h3>
                                      {pageIndex > 0 && pageSections.length === 0 && (
                                          <button 
                                            onClick={() => handleRemovePage(pageIndex)}
                                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                                          >
                                              <Trash2 size={14} /> Remove Page
                                          </button>
                                      )}
                                  </div>

                                  <div className="space-y-2 min-h-[50px]">
                                      {pageSections.length === 0 && (
                                          <div className="text-center py-4 text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                                              Empty Page
                                          </div>
                                      )}
                                      <AnimatePresence mode="popLayout">
                                      {pageSections.map((sectionId, sectionIndex) => (
                                          <motion.div 
                                              layout
                                              key={sectionId}
                                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                              animate={{ opacity: 1, y: 0, scale: 1 }}
                                              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                              transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                              className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group"
                                          >
                                              <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">
                                                  {SECTION_LABELS[sectionId] || sectionId}
                                              </span>
                                              
                                              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                  {/* Reorder within page */}
                                                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded p-0.5">
                                                      <button 
                                                          disabled={sectionIndex === 0}
                                                          onClick={() => handleReorderSection(sectionId, pageIndex, 'up')}
                                                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                                          title="Move Up"
                                                      >
                                                          <ArrowUp size={14} />
                                                      </button>
                                                      <button 
                                                          disabled={sectionIndex === pageSections.length - 1}
                                                          onClick={() => handleReorderSection(sectionId, pageIndex, 'down')}
                                                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                                          title="Move Down"
                                                      >
                                                          <ArrowDown size={14} />
                                                      </button>
                                                  </div>

                                                  {/* Move between pages */}
                                                  <div className="flex bg-blue-50 dark:bg-blue-900/30 rounded p-0.5 ml-2">
                                                      <button 
                                                          disabled={pageIndex === 0}
                                                          onClick={() => handleMoveSection(sectionId, pageIndex, pageIndex - 1)}
                                                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-blue-600 dark:text-blue-400 disabled:opacity-30 disabled:hover:bg-transparent"
                                                          title="Move to Previous Page"
                                                      >
                                                          <FileMinus size={14} />
                                                      </button>
                                                      <button 
                                                          disabled={pageIndex === (data.sectionLayout?.length || 1) - 1}
                                                          onClick={() => handleMoveSection(sectionId, pageIndex, pageIndex + 1)}
                                                          className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-blue-600 dark:text-blue-400 disabled:opacity-30 disabled:hover:bg-transparent"
                                                          title="Move to Next Page"
                                                      >
                                                          <FilePlus size={14} />
                                                      </button>
                                                  </div>
                                              </div>
                                          </motion.div>
                                      ))}
                                      </AnimatePresence>
                                  </div>
                              </motion.div>
                          ))}
                          </AnimatePresence>

                          <button 
                              onClick={handleAddPage}
                              className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors font-medium flex items-center justify-center gap-2"
                          >
                              <Plus size={18} /> Add New Page
                          </button>
                      </div>
                  )}

                  {/* EXPORT */}
                  {activeSection === 'export' && (
                    <div className="flex flex-col gap-6">
                      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Ready to ship?</h3>
                          <p className="text-slate-500 mb-8 max-w-md mx-auto">Your resume looks great! Choose one of the options below to export your document.</p>
                          
                          <div className="flex flex-col sm:flex-row justify-center gap-4">
                              {/* Download PDF (Direct) */}
                              <button 
                                onClick={triggerPrint}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors shadow-sm dark:shadow-lg dark:shadow-blue-900/20"
                              >
                                  <Download size={18} /> Download PDF
                              </button>
                              
                              {/* Export JSON */}
                              <button 
                                onClick={handleExportJson}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                              >
                                  <FileJson size={18} /> Export JSON
                              </button>

                              {/* Print */}
                              <button onClick={triggerPrint} className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                  <Printer size={18} /> Print
                              </button>
                          </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column: Small Preview (Desktop Only) remains same */}
            <div className="hidden xl:block w-[400px] shrink-0">
               <div className="sticky top-6">
                  <div className="bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-xl border border-slate-300 dark:border-slate-700 shadow-lg dark:shadow-xl transition-colors">
                      {/* Zoom Controls */}
                      <div className="flex justify-between items-center mb-2 px-2">
                           <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview</div>
                           <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1 transition-colors">
                               <button 
                                  onClick={() => setIsHandMode(!isHandMode)} 
                                  className={`p-1 rounded transition-colors ${isHandMode ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`} 
                                  title="Pan Tool"
                               >
                                   <Hand size={14} />
                               </button>
                               <div className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                               <button onClick={handleZoomOut} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Zoom Out">
                                   <ZoomOut size={14} />
                               </button>
                               <span className="text-xs font-medium w-8 text-center text-slate-700 dark:text-slate-300">{Math.round(previewScale * 100)}%</span>
                               <button onClick={handleZoomIn} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Zoom In">
                                   <ZoomIn size={14} />
                               </button>
                               <div className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                               <button onClick={handleZoomReset} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Reset Zoom">
                                   <RotateCcw size={14} />
                               </button>
                           </div>
                      </div>
                      
                      <div 
                        ref={previewContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                        className={`bg-slate-200 dark:bg-slate-900 rounded-lg overflow-auto no-scrollbar relative shadow-inner h-[600px] w-full flex items-start justify-center border border-slate-300/50 dark:border-slate-700/50 transition-colors ${isHandMode ? 'cursor-grab' : 'cursor-default'}`}
                        style={{ scrollBehavior: isDragging.current ? 'auto' : 'smooth' }}
                      >
                          <div id="preview-wrapper" className="origin-top transition-transform duration-200 ease-out" style={{ transform: `scale(${previewScale})` }}>
                              <Preview data={data} />
                          </div>
                      </div>
                  </div>
                  <div className="text-center mt-3 text-sm text-slate-600 dark:text-slate-500 font-medium flex items-center justify-center gap-2">
                      <Eye size={14} /> Live Preview
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer / Navigation Buttons */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 backdrop-blur flex justify-between items-center z-10 shrink-0 transition-colors duration-300">
         <button 
            onClick={goToPrev}
            disabled={!prevSection}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
         >
            <ChevronLeft size={18} />
            {prevSection ? `Back: ${prevSection.label}` : 'Back'}
         </button>
         
         <button 
            onClick={goToNext}
            disabled={!nextSection}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md dark:shadow-lg dark:shadow-blue-900/30 transition-all hover:shadow-lg dark:hover:shadow-xl"
         >
            {nextSection ? `Next: ${nextSection.label}` : 'Finish'} <ArrowRight size={18} />
         </button>
      </div>

      {/* Photo Advice Modal */}
      <AnimatePresence>
        {showPhotoAdvice && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowPhotoAdvice(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 dark:text-white">Should you include a photo?</h3>
                    <button onClick={() => setShowPhotoAdvice(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">ONLY include a photo if photos are standard practice in your country</p>
                    
                    <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">When photos are common:</p>
                    <p>Some countries (like Germany, parts of Europe) expect photos on resumes.</p>
                    </div>

                    <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">When photos are NOT recommended:</p>
                    <p>In the US, Canada, UK, and most countries, photos can lead to discrimination and are generally discouraged or even illegal for employers to require.</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                    If you're unsure whether photos are normal in your country, DO NOT include one. When in doubt, leave it out.
                    </div>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                    <button onClick={() => setShowPhotoAdvice(false)} className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
                    Got it
                    </button>
                </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};