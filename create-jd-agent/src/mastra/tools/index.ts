import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { anthropic } from '@ai-sdk/anthropic';

interface JobDescriptionResponse {
  title: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  location: string;
  employmentType: string;
}

export const jdTool = createTool({
  id: 'generate-job-description',
  description: 'Generate a comprehensive job description',
  inputSchema: z.object({
    jobTitle: z.string().describe('The title of the position'),
    company: z.string().describe('The company name'),
    location: z.string().describe('Job location'),
    employmentType: z.string().describe('Type of employment (e.g., Full-time, Part-time, Contract)'),
    keyResponsibilities: z.array(z.string()).optional().describe('Key responsibilities for the role'),
    requiredSkills: z.array(z.string()).optional().describe('Required skills and qualifications'),
    preferredSkills: z.array(z.string()).optional().describe('Preferred skills and qualifications'),
    benefits: z.array(z.string()).optional().describe('Company benefits to include'),
  }),
  outputSchema: z.object({
    title: z.string(),
    overview: z.string(),
    responsibilities: z.array(z.string()),
    requirements: z.array(z.string()),
    benefits: z.array(z.string()),
    location: z.string(),
    employmentType: z.string(),
  }),
  execute: async ({ context }) => {
    const prompt = `Create a professional job description for the following position:

Title: ${context.jobTitle}
Company: ${context.company}
Location: ${context.location}
Employment Type: ${context.employmentType}
${context.keyResponsibilities ? `Key Responsibilities:\n${context.keyResponsibilities.join('\n')}` : ''}
${context.requiredSkills ? `Required Skills:\n${context.requiredSkills.join('\n')}` : ''}
${context.preferredSkills ? `Preferred Skills:\n${context.preferredSkills.join('\n')}` : ''}
${context.benefits ? `Benefits:\n${context.benefits.join('\n')}` : ''}

Please structure the response as a JSON object with the following fields:
- title: The job title
- overview: A brief overview of the role
- responsibilities: Array of key responsibilities
- requirements: Array of required qualifications and skills
- benefits: Array of benefits
- location: The job location
- employmentType: The type of employment

Make the description professional, clear, and engaging. Use inclusive language and avoid discriminatory terms.`;

    const model = anthropic('claude-3-5-sonnet-20241022');
    const response = await model.doGenerate({
      inputFormat: 'messages',
      mode: { type: 'regular' },
      prompt: [{ role: 'user', content: [{ type: 'text', text: prompt }] }]
    });

    try {
      const jobDescription = JSON.parse(response.text || '') as JobDescriptionResponse;
      return jobDescription;
    } catch (error) {
      throw new Error('Failed to parse job description response');
    }
  },
});
