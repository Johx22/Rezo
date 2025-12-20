import React from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Link as LinkIcon, Github } from 'lucide-react';

interface PreviewProps {
  data: ResumeData;
  scale?: number;
}

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1 }) => {
  const hasProfilePicture = data.personalInfo.showProfilePicture && data.personalInfo.profilePicture;
  
  // Default to a single page with all sections if layout is missing (backward compatibility)
  const layout = data.sectionLayout && data.sectionLayout.length > 0 
    ? data.sectionLayout 
    : [['summary', 'experience', 'education', 'internship', 'volunteering', 'certifications', 'projects', 'skills', 'languages']];

  // Calculate approximate total height for margin adjustment when scaled
  const totalHeightMM = layout.length * 297 + (layout.length - 1) * 8; // 8mm gap approx

  const renderSection = (sectionId: string) => {
      switch (sectionId) {
          case 'summary':
              return data.personalInfo.showSummary && data.summary && (
                <section key="summary" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{data.summary}</p>
                </section>
              );
          case 'experience':
              return data.experience.length > 0 && (
                <section key="experience" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">Experience</h2>
                    <div className="space-y-5">
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-800">{exp.position}</h3>
                                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold text-blue-700 mb-2">{exp.company}</div>
                                <div 
                                    className="text-sm text-slate-600 leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
                                    dangerouslySetInnerHTML={{ __html: exp.description }}
                                />
                            </div>
                        ))}
                    </div>
                </section>
              );
          case 'education':
              return data.education.length > 0 && (
                <section key="education" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu) => (
                            <div key={edu.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-slate-800">{edu.school}</h3>
                                    <span className="text-xs font-medium text-slate-500">{edu.graduationDate}</span>
                                </div>
                                <div className="text-sm text-slate-600 mb-1">
                                    {edu.degree} {edu.field && `in ${edu.field}`}
                                </div>
                                {edu.description && (
                                    <div 
                                        className="text-sm text-slate-600 leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
                                        dangerouslySetInnerHTML={{ __html: edu.description }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
              );
          case 'internship':
              return data.internship && data.internship.length > 0 && (
                  <section key="internship" className="break-inside-avoid mb-6">
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">Internships</h2>
                      <div className="space-y-4">
                          {data.internship.map((int) => (
                              <div key={int.id} className="break-inside-avoid">
                                  <div className="flex justify-between items-baseline mb-1">
                                      <h3 className="font-bold text-slate-800">{int.designation}</h3>
                                      <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                          {int.startDate} – {int.endDate}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-semibold text-blue-700">{int.organization}</div>
                                    <div className="text-xs text-slate-500">{int.location}</div>
                                  </div>
                                  {int.keySkills && (
                                      <div className="text-xs text-slate-500 mb-2 italic">
                                          Skills: {int.keySkills}
                                      </div>
                                  )}
                                  <div 
                                      className="text-sm text-slate-600 leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
                                      dangerouslySetInnerHTML={{ __html: int.description }}
                                  />
                              </div>
                          ))}
                      </div>
                  </section>
              );
          case 'volunteering':
              return data.volunteering && data.volunteering.length > 0 && (
                <section key="volunteering" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">Volunteering</h2>
                    <div className="space-y-4">
                        {data.volunteering.map((vol) => (
                            <div key={vol.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-800">{vol.role}</h3>
                                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                        {vol.startDate} – {vol.current ? 'Present' : vol.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="text-sm font-semibold text-blue-700">{vol.organization}</div>
                                    <div className="text-xs text-slate-500">{vol.location}</div>
                                </div>
                                {vol.description && (
                                    <div 
                                        className="text-sm text-slate-600 leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
                                        dangerouslySetInnerHTML={{ __html: vol.description }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
              );
          case 'certifications':
              return data.certifications && data.certifications.length > 0 && (
                <section key="certifications" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">Certifications</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        {data.certifications.map((cert, index) => (
                            <li key={index} className="leading-relaxed">{cert}</li>
                        ))}
                    </ul>
                </section>
              );
          case 'projects':
              return data.projects && data.projects.length > 0 && (
                <section key="projects" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">Projects</h2>
                    <div className="space-y-4">
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="break-inside-avoid">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-bold text-slate-800">{proj.name}</h3>
                                    {(proj.startDate || proj.endDate) && (
                                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                                            {proj.startDate} {proj.startDate && proj.endDate && '–'} {proj.endDate}
                                        </span>
                                    )}
                                </div>
                                {proj.link && (
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <LinkIcon size={12} className="text-blue-500" />
                                        <a href={`https://${proj.link.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">
                                            {proj.link}
                                        </a>
                                    </div>
                                )}
                                {proj.description && (
                                     <div 
                                        className="text-sm text-slate-600 leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
                                        dangerouslySetInnerHTML={{ __html: proj.description }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
              );
          case 'skills':
              return data.skills.length > 0 && (
                <section key="skills" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded print:border print:border-slate-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
              );
          case 'languages':
              return (data.languages || []).length > 0 && (
                <section key="languages" className="break-inside-avoid mb-6">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">Languages</h2>
                    <div className="flex flex-wrap gap-2">
                        {(data.languages || []).map((lang, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded print:border print:border-slate-200">
                                {lang}
                            </span>
                        ))}
                    </div>
                </section>
              );
          default:
              return null;
      }
  };

  return (
    <div 
        className="mx-auto origin-top transition-transform duration-200"
        style={{ 
            width: '210mm', 
            // IMPORTANT: Remove transform when scale is 1 (Printing). 
            // Transformed elements act as containing blocks and break standard pagination.
            transform: scale !== 1 ? `scale(${scale})` : 'none', 
            marginBottom: scale !== 1 ? `${(scale - 1) * totalHeightMM}mm` : 0 
        }}
    >
        {layout.map((pageSections, pageIndex) => (
            <div 
                key={pageIndex}
                className="bg-white shadow-2xl print:shadow-none mb-8 print:mb-0 relative overflow-hidden flex flex-col print-page"
                style={{ 
                    width: '210mm', 
                    height: '297mm', // Strict A4 Height
                    pageBreakAfter: pageIndex < layout.length - 1 ? 'always' : 'auto',
                }}
            >
                {/* Header - Only on Page 1 */}
                {pageIndex === 0 && (
                    <div className="px-8 py-10 bg-slate-900 text-white print:bg-slate-900 print:text-white print-color-adjust-exact">
                        <div className={`flex ${hasProfilePicture ? 'gap-8 items-center' : ''}`}>
                            
                            {hasProfilePicture && (
                                <div className="shrink-0">
                                    <img 
                                        src={data.personalInfo.profilePicture} 
                                        alt={data.personalInfo.fullName} 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-xl"
                                    />
                                </div>
                            )}

                            <div className="flex-1">
                                <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">{data.personalInfo.fullName}</h1>
                                <p className="text-lg text-blue-200 font-medium tracking-wide mb-6">{data.personalInfo.title}</p>
                                
                                <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                                    {data.personalInfo.email && (
                                        <div className="flex items-center gap-1.5">
                                            <Mail size={14} className="stroke-blue-400" />
                                            <span>{data.personalInfo.email}</span>
                                        </div>
                                    )}
                                    {data.personalInfo.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone size={14} className="stroke-blue-400" />
                                            <span>{data.personalInfo.phone}</span>
                                        </div>
                                    )}
                                    {data.personalInfo.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="stroke-blue-400" />
                                            <span>{data.personalInfo.location}</span>
                                        </div>
                                    )}
                                    {data.personalInfo.linkedin && (
                                        <div className="flex items-center gap-1.5">
                                            <Linkedin size={14} className="stroke-blue-400" />
                                            <span>{data.personalInfo.linkedin}</span>
                                        </div>
                                    )}
                                    {data.personalInfo.github && (
                                        <div className="flex items-center gap-1.5">
                                            <Github size={14} className="stroke-blue-400" />
                                            <span>{data.personalInfo.github}</span>
                                        </div>
                                    )}
                                    {data.personalInfo.website && (
                                        <div className="flex items-center gap-1.5">
                                            <Globe size={14} className="stroke-blue-400" />
                                            <span>{data.personalInfo.website}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="p-8 flex-1">
                    {pageSections.map(sectionId => renderSection(sectionId))}
                </div>

                {/* Footer for pages > 1 */}
                {pageIndex > 0 && (
                     <div className="absolute bottom-4 right-8 text-xs text-slate-400">
                        Page {pageIndex + 1}
                     </div>
                )}
            </div>
        ))}

        <style>{`
            @media print {
                .print-page {
                    break-after: page;
                    page-break-after: always;
                    height: 297mm !important;
                    overflow: hidden !important;
                    margin-bottom: 0 !important;
                    box-shadow: none !important;
                }
                .print-page:last-child {
                    break-after: auto;
                    page-break-after: auto;
                }
                /* Ensure background colors print */
                * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `}</style>
    </div>
  );
};