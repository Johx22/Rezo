import { GoogleGenAI } from "@google/genai";
import { ResumeData } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateResumeSummary = async (data: ResumeData): Promise<string> => {
  const ai = getClient();
  const experienceText = data.experience
    .map(exp => `${exp.position} at ${exp.company}: ${exp.description}`)
    .join('\n');
  
  const skillsText = data.skills.join(', ');

  const prompt = `
    You are an expert resume writer. Write a professional, concise, and impactful resume summary (3-4 sentences max) for a candidate with the following background:
    
    Current Title: ${data.personalInfo.title}
    Skills: ${skillsText}
    Experience Highlights:
    ${experienceText}

    Focus on achievements and professional value. Do not use first-person pronouns overly much, but keep it active voice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

export const enhanceDescription = async (text: string, title: string): Promise<string> => {
  const ai = getClient();
  const prompt = `
    You are an expert resume writer. Rewrite the following resume job description bullet points to be more professional, action-oriented, and impactful.
    Use strong action verbs. Quantify achievements where possible (add placeholders like [X]% if specific numbers aren't provided but would be good).
    Maintain the original meaning but improve clarity and flow.
    
    Job Title: ${title}
    Original Description:
    ${text}

    Return only the rewritten text, formatted as bullet points (using • or -).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Error enhancing description:", error);
    throw error;
  }
};

export const suggestSkills = async (title: string, currentSkills: string[]): Promise<string[]> => {
  const ai = getClient();
  const prompt = `
    Based on the job title "${title}", suggest 10 relevant technical and soft skills that are highly valued in the industry.
    The user already lists: ${currentSkills.join(', ')}.
    Do not duplicate existing skills.
    Return the result as a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    const text = response.text || "[]";
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
        return parsed.map(String);
    }
    return [];
  } catch (error) {
    console.error("Error suggesting skills:", error);
    return [];
  }
};
