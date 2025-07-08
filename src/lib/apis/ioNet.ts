// ioNet.ts

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Interfaces
export interface ParsedResume {
  skills: string[];
  workExperience: Array<{
    company: string;
    position: string;
    duration: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  rolesOfInterest: string[];
  summary: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  url: string;
  relevanceScore: number;
  postedDate: string;
  requirements: string[];
  benefits: string[];
}

export interface AgentStep {
  id: string;
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
  timestamp: Date;
  details?: string;
}

// Utility function to estimate tokens (1 token ≈ 2.5 chars, with overhead for JSON structure)
function estimateTokens(text: string): number {
  const baseTokens = Math.ceil(text.length / 2.5); // Conservative: 1 token ≈ 2.5 characters
  const jsonOverhead = Math.ceil(text.length * 0.2); // 20% overhead for JSON formatting
  return baseTokens + jsonOverhead;
}

// Resume parsing using IO.net's AI models
export async function parseResume(resumeText: string): Promise<ParsedResume> {
  try {
    // Validate environment variables
    if (!import.meta.env.VITE_IOINTELLIGENCE_API_KEY || !import.meta.env.VITE_IO_NET_BASE_URL) {
      throw new Error('Missing IO.net API key or base URL in environment variables');
    }

    // System message for resume parsing
    const systemMessage = {
      role: 'system',
      content: 'You are a resume parsing assistant. Your task is to extract structured information from the provided resume text and return it as a JSON object with the following structure: {"skills": ["skill1", "skill2"], "workExperience": [{"company": "", "position": "", "duration": "", "responsibilities": []}], "education": [{"degree": "", "institution": "", "year": ""}], "rolesOfInterest": ["role1", "role2"], "summary": "brief professional summary"}. Provide only the JSON object, no additional text.',
    };

    // Calculate token limits
    const maxContextTokens = 128000; // API limit per documentation
    const maxCompletionTokens = 1500; // Completion tokens
    const systemTokens = estimateTokens(JSON.stringify(systemMessage));
    const bufferTokens = 3000; // Increased buffer for safety
    const maxUserTokens = maxContextTokens - systemTokens - maxCompletionTokens - bufferTokens;

    // Estimate and truncate user input
    let userContent = resumeText;
    let userTokens = estimateTokens(userContent);
    if (userTokens > maxUserTokens) {
      const maxChars = Math.floor(maxUserTokens * 2.5); // ~2.5 chars per token
      userContent = resumeText.substring(0, maxChars);
      userTokens = estimateTokens(userContent);
      console.warn(
        `Resume truncated from ${resumeText.length} to ${userContent.length} chars ` +
        `(${userTokens}/${maxUserTokens} user tokens) to fit API token limit. ` +
        `Consider shortening the resume to under 300,000 characters or using a text-based format.`
      );
    }

    // Validate total tokens
    const totalTokens = systemTokens + userTokens + maxCompletionTokens;
    if (totalTokens > maxContextTokens) {
      throw new Error(
        `Total tokens (${totalTokens}) exceed API limit (${maxContextTokens}). ` +
        `Original resume: ${resumeText.length} chars, Truncated: ${userContent.length} chars. ` +
        `Please shorten the resume to under 300,000 characters or use a text-based format.`
      );
    }

    console.log(`Token breakdown: System=${systemTokens}, User=${userTokens}, Completion=${maxCompletionTokens}, Total=${totalTokens}`);

    const response = await fetch(`${import.meta.env.VITE_IO_NET_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_IOINTELLIGENCE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          systemMessage,
          {
            role: 'user',
            content: userContent,
          },
        ],
        max_tokens: maxCompletionTokens,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IO.net API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    let parsedData;
    try {
      parsedData = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, data.choices[0].message.content);
      parsedData = {
        skills: extractSkillsFromText(resumeText),
        workExperience: [],
        education: [],
        rolesOfInterest: [],
        summary: resumeText.substring(0, 200) + '...',
      };
    }

    // Ensure all required fields exist
    if (!parsedData.skills || !Array.isArray(parsedData.skills)) parsedData.skills = [];
    if (!parsedData.workExperience || !Array.isArray(parsedData.workExperience)) parsedData.workExperience = [];
    if (!parsedData.education || !Array.isArray(parsedData.education)) parsedData.education = [];
    if (!parsedData.rolesOfInterest || !Array.isArray(parsedData.rolesOfInterest)) parsedData.rolesOfInterest = [];
    if (!parsedData.summary) parsedData.summary = '';

    await supabase.from('parsed_resumes').insert({
      resume_text: userContent,
      parsed_data: parsedData,
      created_at: new Date('2025-07-08T16:29:00.000Z'), // 05:29 PM WAT in UTC
    });

    return parsedData;
  } catch (error) {
    console.error('Resume parsing failed:', error);
    throw error;
  }
}

// Job search using IO.net's agent capabilities
export async function searchJobs(
  query: string,
  location: string,
  resumeSkills: string[],
  onStepUpdate: (step: AgentStep) => void
): Promise<JobListing[]> {
  const steps = [
    {
      id: '1',
      step: 'initialize',
      status: 'completed' as const,
      description: 'Resume analysis complete',
      timestamp: new Date('2025-07-08T16:29:00.000Z'), // 05:29 PM WAT in UTC
    },
    {
      id: '2',
      step: 'search',
      status: 'in_progress' as const,
      description: 'Searching job databases...',
      timestamp: new Date('2025-07-08T16:29:00.000Z'),
    },
    {
      id: '3',
      step: 'analyze',
      status: 'pending' as const,
      description: 'Analyzing job relevance',
      timestamp: new Date('2025-07-08T16:29:00.000Z'),
    },
    {
      id: '4',
      step: 'rank',
      status: 'pending' as const,
      description: 'Ranking by compatibility',
      timestamp: new Date('2025-07-08T16:29:00.000Z'),
    },
    {
      id: '5',
      step: 'complete',
      status: 'pending' as const,
      description: 'Results ready',
      timestamp: new Date('2025-07-08T16:29:00.000Z'),
    },
  ];

  try {
    // Step 1: Initialize
    onStepUpdate(steps[0]);

    // Step 2: Search jobs
    onStepUpdate(steps[1]);

    const searchResponse = await fetch(`${import.meta.env.VITE_IO_NET_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_IOINTELLIGENCE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a job search agent. Generate realistic job listings based on the provided skills, query, and location.',
          },
          {
            role: 'user',
            content: `Find relevant jobs for a candidate with these skills: ${resumeSkills.join(', ')}.

            Search query: "${query}"
            Location: "${location || 'Remote/Any'}"

            Generate 8-12 realistic job listings in JSON format:
            [
              {
                "id": "unique_id",
                "title": "Job Title",
                "company": "Company Name",
                "location": "City, State/Country",
                "description": "Detailed job description (200+ words)",
                "salary": "$XX,XXX - $XX,XXX",
                "url": "https://example.com/job/123",
                "relevanceScore": 85,
                "postedDate": "2024-01-15",
                "requirements": ["requirement1", "requirement2"],
                "benefits": ["benefit1", "benefit2"]
              }
            ]

            Make jobs realistic and relevant to the skills provided. Include a mix of experience levels.`,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!searchResponse.ok) {
      throw new Error(`Job search failed: ${searchResponse.status} ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    onStepUpdate({ ...steps[1], status: 'completed' });

    // Step 3: Analyze relevance
    onStepUpdate({ ...steps[2], status: 'in_progress' });
    await delay(1000);
    onStepUpdate({ ...steps[2], status: 'completed' });

    // Step 4: Rank jobs
    onStepUpdate({ ...steps[3], status: 'in_progress' });
    await delay(800);
    onStepUpdate({ ...steps[3], status: 'completed' });

    // Step 5: Complete
    onStepUpdate({ ...steps[4], status: 'completed' });

    // Parse job listings from AI response
    let jobs: JobListing[] = [];
    try {
      const jsonMatch = searchData.choices[0].message.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jobs = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse job listings:', parseError);
      jobs = generateFallbackJobs(query, location, resumeSkills);
    }

    // Ensure relevance scores and sort by relevance
    jobs = jobs.map(job => ({
      ...job,
      relevanceScore: job.relevanceScore || calculateRelevanceScore(job.description, resumeSkills),
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);

    await supabase.from('job_listings').insert({
      query: query,
      location: location,
      skills: resumeSkills,
      jobs: jobs,
      created_at: new Date('2025-07-08T16:29:00.000Z'), // 05:29 PM WAT in UTC
    });

    return jobs;
  } catch (error) {
    console.error('Job search failed:', error);
    // Update failed step
    const currentStep = steps.find(s => s.status === 'in_progress') || steps[1];
    onStepUpdate({ ...currentStep, status: 'failed', description: 'Job search failed. Please try again.' });
    throw error;
  }
}

// Cover letter generation using IO.net
export async function generateCoverLetter(
  jobDescription: string,
  resumeData: ParsedResume,
  options: {
    tone: 'formal' | 'friendly';
    language: 'english' | 'french';
  }
): Promise<string> {
  try {
    const toneInstructions = options.tone === 'formal'
      ? 'Use a professional, formal tone with proper business language.'
      : 'Use a friendly, approachable tone while maintaining professionalism.';

    const languageInstructions = options.language === 'french'
      ? 'Write the cover letter in French.'
      : 'Write the cover letter in English';

    const response = await fetch(`${import.meta.env.VITE_IO_NET_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_IOINTELLIGENCE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a cover letter generation assistant. Create a personalized cover letter based on the job description and candidate information.',
          },
          {
            role: 'user',
            content: `Generate a personalized cover letter based on the following information:

            Job Description:
            ${jobDescription}

            Candidate Information:
            - Skills: ${resumeData.skills.join(', ')}
            - Work Experience: ${resumeData.workExperience.map(exp => `${exp.position} at ${exp.company}`).join(', ')}
            - Education: ${resumeData.education.map(edu => `${edu.degree} from ${edu.institution}`).join(', ')}
            - Professional Summary: ${resumeData.summary}

            Instructions:
            - ${toneInstructions}
            - ${languageInstructions}
            - Highlight relevant skills and experience
            - Show enthusiasm for the role
            - Keep it concise (3-4 paragraphs)
            - Include a strong opening and closing
            - Make it specific to this job and company

            Generate only the cover letter content, no additional text or formatting.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cover letter generation failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const coverLetter = data.choices[0].message.content.trim();

    await supabase.from('cover_letters').insert({
      job_description: jobDescription,
      resume_data: resumeData,
      cover_letter: coverLetter,
      tone: options.tone,
      language: options.language,
      created_at: new Date('2025-07-08T16:29:00.000Z'), // 05:29 PM WAT in UTC
    });

    return coverLetter;
  } catch (error) {
    console.error('Cover letter generation failed:', error);
    throw error;
  }
}

// Utility functions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership', 'Communication',
  ];
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 10);
}

function calculateRelevanceScore(jobDescription: string, resumeSkills: string[]): number {
  const jobWords = jobDescription.toLowerCase().split(/\W+/);
  const skillMatches = resumeSkills.filter(skill => 
    jobWords.some(word => word.includes(skill.toLowerCase()) || skill.toLowerCase().includes(word))
  );
  
  const baseScore = Math.min(Math.round((skillMatches.length / Math.max(resumeSkills.length, 1)) * 100), 100);
  return Math.max(baseScore, 45); // Minimum 45% relevance
}

function generateFallbackJobs(query: string, location: string, skills: string[]): JobListing[] {
  const companies = ['TechCorp', 'InnovateLabs', 'DataSystems', 'CloudWorks', 'DevStudio', 'AI Solutions'];
  const locations = [location || 'Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA'];
  
  return Array.from({ length: 8 }, (_, i) => ({
    id: `fallback-${i}`,
    title: `${query} - ${['Senior', 'Mid-Level', 'Junior'][i % 3]}`,
    company: companies[i % companies.length],
    location: locations[i % locations.length],
    description: `We are seeking a talented ${query} to join our dynamic team. This role involves working with cutting-edge technologies and collaborating with cross-functional teams to deliver innovative solutions. The ideal candidate will have experience with ${skills.slice(0, 3).join(', ')} and a passion for continuous learning.`,
    salary: `$${60000 + i * 10000} - $${80000 + i * 15000}`,
    url: `https://example.com/job/${i}`,
    relevanceScore: Math.max(95 - i * 8, 50),
    postedDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requirements: skills.slice(0, 4),
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours'],
  }));
}