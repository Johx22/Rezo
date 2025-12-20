import React, { useRef, useEffect, useState, useLayoutEffect, ReactNode } from 'react';
import { ResumeData } from '../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Link as LinkIcon, Github } from 'lucide-react';

interface PreviewProps {
  data: ResumeData;
  scale?: number;
}

interface Block {
    id: string;
    content: ReactNode;
    type: 'header' | 'content';
}

export const Preview: React.FC<PreviewProps> = ({ data, scale = 1 }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pages, setPages] = useState<Block[][]>([]);
  const measureRef = useRef<HTMLDivElement>(null);
  
  // A4 Constants in Pixels (96 DPI)
  // 297mm = 1122.5px
  // Safe content height = Total - Top/Bottom Padding.
  // We use px-8 for padding, which is 2rem = 32px.
  // Let's assume a safe render height of approx 1100px to be safe, minus top/bottom padding logic.
  const PAGE_HEIGHT = 1122; 
  
  // 1. Generate Blocks from Data
  useEffect(() => {
    const newBlocks: Block[] = [];
    const hasProfilePicture = data.personalInfo.showProfilePicture && data.personalInfo.profilePicture;

    // --- Header Block ---
    newBlocks.push({
        id: 'header',
        type: 'header',
        content: (
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
        )
    });

    // Helper for Section Titles
    const renderSectionTitle = (title: string) => (
        <div className="pb-1 mb-4 border-b-2 border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h2>
        </div>
    );

    // --- Summary ---
    if (data.personalInfo.showSummary && data.summary) {
        newBlocks.push({
            id: 'summary-title',
            type: 'content',
            content: renderSectionTitle('Professional Summary')
        });
        newBlocks.push({
            id: 'summary-text',
            type: 'content',
            content: <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap mb-6">{data.summary}</p>
        });
    }

    // --- Experience ---
    if (data.experience.length > 0) {
        newBlocks.push({ id: 'exp-title', type: 'content', content: renderSectionTitle('Experience') });
        data.experience.forEach((exp) => {
            newBlocks.push({
                id: `exp-${exp.id}`,
                type: 'content',
                content: (
                    <div className="mb-5">
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
                )
            });
        });
    }

    // --- Education ---
    if (data.education.length > 0) {
        newBlocks.push({ id: 'edu-title', type: 'content', content: renderSectionTitle('Education') });
        data.education.forEach((edu) => {
            newBlocks.push({
                id: `edu-${edu.id}`,
                type: 'content',
                content: (
                    <div className="mb-4">
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
                )
            });
        });
    }

    // --- Volunteering ---
    if (data.volunteering && data.volunteering.length > 0) {
        newBlocks.push({ id: 'vol-title', type: 'content', content: renderSectionTitle('Volunteering') });
        data.volunteering.forEach((vol) => {
            newBlocks.push({
                id: `vol-${vol.id}`,
                type: 'content',
                content: (
                    <div className="mb-4">
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
                )
            });
        });
    }

    // --- Certifications ---
    if (data.certifications && data.certifications.length > 0) {
        newBlocks.push({ id: 'cert-title', type: 'content', content: renderSectionTitle('Certifications') });
        newBlocks.push({
            id: 'cert-list',
            type: 'content',
            content: (
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 mb-6">
                    {data.certifications.map((cert, index) => (
                        <li key={index} className="leading-relaxed">{cert}</li>
                    ))}
                </ul>
            )
        });
    }

    // --- Projects ---
    if (data.projects && data.projects.length > 0) {
        newBlocks.push({ id: 'proj-title', type: 'content', content: renderSectionTitle('Projects') });
        data.projects.forEach((proj) => {
            newBlocks.push({
                id: `proj-${proj.id}`,
                type: 'content',
                content: (
                    <div className="mb-4">
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
                )
            });
        });
    }

    // --- Skills ---
    if (data.skills.length > 0) {
        newBlocks.push({ id: 'skills-title', type: 'content', content: renderSectionTitle('Skills') });
        newBlocks.push({
            id: 'skills-list',
            type: 'content',
            content: (
                <div className="flex flex-wrap gap-2 mb-6">
                    {data.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded print:border print:border-slate-200">
                            {skill}
                        </span>
                    ))}
                </div>
            )
        });
    }

    // --- Languages ---
    if ((data.languages || []).length > 0) {
        newBlocks.push({ id: 'lang-title', type: 'content', content: renderSectionTitle('Languages') });
        newBlocks.push({
            id: 'lang-list',
            type: 'content',
            content: (
                <div className="flex flex-wrap gap-2 mb-6">
                    {(data.languages || []).map((lang, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded print:border print:border-slate-200">
                            {lang}
                        </span>
                    ))}
                </div>
            )
        });
    }

    setBlocks(newBlocks);
  }, [data]);

  // 2. Measure and Pagination Logic
  useLayoutEffect(() => {
    if (!measureRef.current) return;

    const measureNodes = measureRef.current.children;
    const newPages: Block[][] = [[]];
    let currentPageIndex = 0;
    let currentHeight = 0;
    const SAFETY_MARGIN = 20; // Extra buffer to prevent cutoff
    const PADDING_Y = 64; // px-8 top + bottom approx (32+32)

    Array.from(measureNodes).forEach((node, index) => {
        const height = node.getBoundingClientRect().height;
        const block = blocks[index];

        // Determine max allowed height for this page
        // If it's the first page, we have strict bounds.
        // We account for padding only for content blocks, Header is full bleed but adds height.
        
        let effectiveHeight = height;
        // Standardize calculation: 
        // We fill up to PAGE_HEIGHT. 
        // Blocks include their internal margins.
        
        // Check if adding this block exceeds page height
        if (currentHeight + effectiveHeight > PAGE_HEIGHT - SAFETY_MARGIN) {
            // Push to next page
            currentPageIndex++;
            newPages[currentPageIndex] = [];
            currentHeight = PADDING_Y; // New page starts with content padding implicitly
            
            // If the block is massive (larger than a whole page), it will just overflow,
            // but for resumes, blocks are usually small enough.
        }

        newPages[currentPageIndex].push(block);
        currentHeight += effectiveHeight;
    });

    setPages(newPages);

  }, [blocks, scale]);

  return (
    <div className="flex flex-col items-center">
        {/* Hidden Measurement Layer */}
        <div 
            ref={measureRef} 
            className="absolute top-0 left-0 w-[210mm] opacity-0 pointer-events-none z-[-1]" 
            aria-hidden="true"
        >
            {blocks.map(block => (
                <div key={block.id} className={block.type === 'header' ? '' : 'px-8'}>
                    {block.content}
                </div>
            ))}
        </div>

        {/* Visible Pages */}
        {pages.map((pageBlocks, i) => (
            <div 
                key={i}
                className="bg-white shadow-2xl print:shadow-none mx-auto relative mb-8 last:mb-0 print:mb-0 print:break-after-page page-break-target"
                style={{ 
                    width: '210mm', 
                    height: '297mm',
                    minHeight: '297mm',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    // Adjust margin based on scale to prevent overlap visually in preview
                    marginBottom: scale !== 1 ? `${(scale * 297) - 297 + 30}px` : '2rem'
                }}
            >
                {/* Content Container */}
                <div className="h-full w-full">
                    {pageBlocks.map(block => (
                         <div key={block.id} className={block.type === 'header' ? '' : 'px-8'}>
                            {block.content}
                        </div>
                    ))}
                </div>
            </div>
        ))}

        <style>{`
            @media print {
                .page-break-target {
                    break-after: page;
                    margin-bottom: 0 !important;
                    box-shadow: none !important;
                    height: auto !important;
                    min-height: 297mm !important;
                }
                body {
                    background: white;
                }
            }
        `}</style>
    </div>
  );
};