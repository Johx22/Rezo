import React from 'react';
import { ResumeData } from '../types';
import { Link as LinkIcon } from 'lucide-react';

interface PreviewProps {
  data: ResumeData;
  scale?: number;
}

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1 }) => {
  // Default to a single page with all sections if layout is missing (backward compatibility)
  const layout = data.sectionLayout && data.sectionLayout.length > 0 
    ? data.sectionLayout 
    : [['summary', 'experience', 'education', 'internship', 'volunteering', 'certifications', 'projects', 'publications', 'skills', 'languages']];

  // Calculate approximate total height for margin adjustment when scaled
  const totalHeightMM = layout.length * 297 + (layout.length - 1) * 8; // 8mm gap approx

  const renderSection = (sectionId: string) => {
      switch (sectionId) {
          case 'summary':
              return data.personalInfo.showSummary && data.summary && (
                <section key="summary" className="break-inside-avoid">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-2.5 text-left">Professional Summary</h2>
                    <p className="text-[12.5px] leading-relaxed whitespace-pre-wrap">{data.summary}</p>
                </section>
              );
          case 'experience':
              return data.experience.length > 0 && (
                <section key="experience" className="break-inside-avoid">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-3.5 text-left">Experience</h2>
                    <div className="space-y-4">
                        {data.experience.map((exp) => (
                            <div key={exp.id} className="break-inside-avoid text-[12.5px]">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold">{exp.company}</h3>
                                    <span className="font-medium whitespace-nowrap text-[11px]">
                                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline mb-1.5">
                                    <span className="italic">{exp.position}</span>
                                </div>
                                <div 
                                    className="leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5"
                                    dangerouslySetInnerHTML={{ __html: exp.description }}
                                />
                            </div>
                        ))}
                    </div>
                </section>
              );
          case 'education':
              return data.education.length > 0 && (
                <section key="education" className="break-inside-avoid">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-3.5 text-left">Education</h2>
                    <div className="space-y-3">
                        {data.education.map((edu) => (
                            <div key={edu.id} className="break-inside-avoid text-[12.5px]">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold">{edu.school}</h3>
                                    <span className="font-medium text-[11px]">{edu.graduationDate}</span>
                                </div>
                                <div className="flex justify-between items-baseline mb-1.5">
                                    <span className="italic">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                                </div>
                                {edu.description && (
                                    <div 
                                        className="leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5"
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
                  <section key="internship" className="break-inside-avoid">
                      <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-3.5 text-left">Internships</h2>
                      <div className="space-y-3">
                          {data.internship.map((int) => (
                              <div key={int.id} className="break-inside-avoid text-[12.5px]">
                                  <div className="flex justify-between items-baseline mb-0.5">
                                      <h3 className="font-bold">{int.organization}</h3>
                                      <span className="font-medium whitespace-nowrap text-[11px]">
                                          {int.startDate} – {int.endDate}
                                      </span>
                                  </div>
                                  <div className="flex justify-between items-baseline mb-1">
                                      <span className="italic">{int.designation}</span>
                                      <span className="italic">{int.location}</span>
                                  </div>
                                  {int.keySkills && (
                                      <div className="text-[11.5px] mb-1 italic font-sans">
                                          Skills: {int.keySkills}
                                      </div>
                                  )}
                                  <div 
                                      className="leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5"
                                      dangerouslySetInnerHTML={{ __html: int.description }}
                                  />
                              </div>
                          ))}
                      </div>
                  </section>
              );
          case 'volunteering':
              return data.volunteering && data.volunteering.length > 0 && (
                <section key="volunteering" className="break-inside-avoid">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-3.5 text-left">Volunteering</h2>
                    <div className="space-y-3">
                        {data.volunteering.map((vol) => (
                            <div key={vol.id} className="break-inside-avoid text-[12.5px]">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold">{vol.organization}</h3>
                                    <span className="font-medium whitespace-nowrap text-[11px]">
                                        {vol.startDate} – {vol.current ? 'Present' : vol.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="italic">{vol.role}</span>
                                    <span className="italic">{vol.location}</span>
                                </div>
                                {vol.description && (
                                    <div 
                                        className="leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5"
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
                <section key="certifications" className="break-inside-avoid">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-2 text-left">Certifications</h2>
                    <ul className="list-disc list-inside space-y-0.5 text-[12.5px]">
                        {data.certifications.map((cert, index) => (
                            <li key={index} className="leading-relaxed">{cert}</li>
                        ))}
                    </ul>
                </section>
              );
          case 'projects':
              return data.projects && data.projects.length > 0 && (
                <section key="projects" className="break-inside-avoid">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-3.5 text-left">Projects</h2>
                    <div className="space-y-3">
                        {data.projects.map((proj) => (
                            <div key={proj.id} className="break-inside-avoid text-[12.5px]">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold">{proj.name}</h3>
                                    {(proj.startDate || proj.endDate) && (
                                        <span className="font-medium whitespace-nowrap text-[11px]">
                                            {proj.startDate} {proj.startDate && proj.endDate && '–'} {proj.endDate}
                                        </span>
                                    )}
                                </div>
                                {proj.link && (
                                    <div className="flex items-center gap-1 mb-1 text-[11.5px] font-sans">
                                        <LinkIcon size={11} />
                                        <a href={`https://${proj.link.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="underline hover:no-underline">
                                            {proj.link}
                                        </a>
                                    </div>
                                )}
                                {proj.description && (
                                     <div 
                                        className="leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5"
                                        dangerouslySetInnerHTML={{ __html: proj.description }}
                                     />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
              );
          case 'publications':
              return data.publications && data.publications.length > 0 && (
                <section key="publications" className="break-inside-avoid">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-3.5 text-left">Publications</h2>
                    <div className="space-y-3">
                        {data.publications.map((pub) => (
                            <div key={pub.id} className="break-inside-avoid text-[12.5px]">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold">{pub.name}</h3>
                                    <span className="font-medium whitespace-nowrap text-[11px]">
                                        {pub.date}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="italic">{pub.publisher}</span>
                                    {pub.link && (
                                        <span className="text-[11.5px] font-sans">
                                            <a href={`https://${pub.link.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="underline hover:no-underline">
                                                Link
                                            </a>
                                        </span>
                                    )}
                                </div>
                                {pub.description && (
                                     <div 
                                        className="leading-relaxed pl-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-0.5"
                                        dangerouslySetInnerHTML={{ __html: pub.description }}
                                     />
                                )}
                            </div>
                        ))}
                    </div>
                </section>
              );
          case 'skills':
              const hasSkills = data.skills.length > 0;
              const hasInterests = data.interests && data.interests.length > 0;
              return (hasSkills || hasInterests) && (
                <section key="skills" className="break-inside-avoid text-[12.5px]">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-2 text-left">Skills & Interests</h2>
                    {hasSkills && (
                        <p className="leading-relaxed">
                            <span className="font-bold">Skills: </span>
                            {data.skills.join(', ')}
                        </p>
                    )}
                    {hasInterests && (
                        <p className="leading-relaxed mt-1">
                            <span className="font-bold">Interests: </span>
                            {data.interests.join(', ')}
                        </p>
                    )}
                </section>
              );
          case 'languages':
              return (data.languages || []).length > 0 && (
                <section key="languages" className="break-inside-avoid text-[12.5px]">
                    <h2 className="text-[13px] font-bold uppercase tracking-wide border-b border-slate-950 pb-[2px] mb-2 text-left">Languages</h2>
                    <p className="leading-relaxed">
                        <span className="font-bold">Languages: </span>
                        {(data.languages || []).join(', ')}
                    </p>
                </section>
              );
          default:
              return null;
      }
  };

  return (
    <div 
        className="mx-auto origin-top transition-transform duration-200 font-cm-serif text-slate-950"
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
                className="bg-white shadow-2xl rounded-2xl print:rounded-none print:shadow-none mb-8 print:mb-0 relative overflow-hidden flex flex-col print-page"
                style={{ 
                    width: '210mm', 
                    height: '297mm', // Strict A4 Height
                    pageBreakAfter: pageIndex < layout.length - 1 ? 'always' : 'auto',
                }}
            >
                {/* Header - Only on Page 1 */}
                {pageIndex === 0 && (
                    <div className="px-10 pt-10 pb-4 text-center select-none bg-white">
                        <h1 className="text-4xl font-normal mb-1.5">{data.personalInfo.fullName}</h1>
                        {data.personalInfo.title && (
                            <p className="text-[14px] font-semibold tracking-wider uppercase mb-2">{data.personalInfo.title}</p>
                        )}
                        
                        {/* Contact Information Bar */}
                        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[12.5px] font-medium max-w-xl mx-auto pt-1 select-all">
                            {(() => {
                                const items = [];
                                if (data.personalInfo.phone) items.push(data.personalInfo.phone);
                                if (data.personalInfo.email) items.push(data.personalInfo.email);
                                if (data.personalInfo.linkedin) items.push(data.personalInfo.linkedin);
                                if (data.personalInfo.github) items.push(data.personalInfo.github);
                                if (data.personalInfo.website) items.push(data.personalInfo.website);
                                if (data.personalInfo.location) items.push(data.personalInfo.location);
                                
                                return items.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        {idx > 0 && <span className="text-slate-400 font-light select-none px-1.5">|</span>}
                                        <span className="hover:text-black transition-colors">{item}</span>
                                    </React.Fragment>
                                ));
                            })()}
                        </div>
                    </div>
                )}

                {/* Content - No Card border/shading, just flat spacing */}
                <div className="px-10 pb-10 pt-4 flex-1 flex flex-col gap-6">
                    {pageSections.length > 0 && (
                        <div className="flex-1 flex flex-col gap-5">
                            {pageSections.map(sectionId => renderSection(sectionId))}
                        </div>
                    )}
                </div>

                {/* Footer for pages > 1 */}
                {pageIndex > 0 && (
                     <div className="absolute bottom-4 right-10 text-xs">
                        Page {pageIndex + 1}
                     </div>
                )}
            </div>
        ))}

        <style>{`
            .font-cm-serif {
                font-family: 'Computer Modern Serif', Georgia, serif;
            }
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