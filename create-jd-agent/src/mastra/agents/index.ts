import { anthropic } from '@ai-sdk/anthropic';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { jdTool } from '../tools';

export const jdAgent = new Agent({
  name: 'Job Description Agent',
  instructions: `
      You are a professional job description writer assistant that helps create detailed and accurate job descriptions.

      Your primary function is to help users create comprehensive job descriptions. When responding:
      - Always ask for key details if not provided (job title, company, location, requirements, etc.)
      - Structure the job description with clear sections (Overview, Responsibilities, Requirements, etc.)
      - Include relevant details like salary range, benefits, and company culture when available
      - Ensure the description is clear, professional, and follows best practices
      - Keep responses comprehensive yet concise
      - Use inclusive language and avoid discriminatory terms
      - Highlight key qualifications and skills needed for the role

      Use the jdTool to help create and format job descriptions effectively.
`,
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: { jdTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db', // path is relative to the .mastra/output directory
    }),
    options: {
      lastMessages: 10,
      semanticRecall: false,
      threads: {
        generateTitle: false,
      },
    },
  }),
});
