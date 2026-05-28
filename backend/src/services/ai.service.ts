import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { GeneratedPaperSchema, type GeneratedPaper } from './ai.schema.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function extractJsonObject(text: string): unknown {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export const generateQuestions = async (data: {
  subject: string;
  grade: string;
  questionTypes: { type: string; count: number; marks: number }[];
  additionalInstructions?: string;
}): Promise<GeneratedPaper> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    Generate a school assessment for:
    Subject: ${data.subject}
    Grade/Class: ${data.grade}
    
    Structure:
    ${data.questionTypes.map((qt) => `- ${qt.count} x ${qt.type} (${qt.marks} marks each)`).join('\n')}
    
    Additional Instructions: ${data.additionalInstructions || 'None'}
    
    Return ONLY valid JSON (no markdown, no code fences, no commentary) in this format:
    {
      "sections": [
        {
          "title": "Section A",
          "description": "Instruction for the section (e.g. Attempt all questions)",
          "questions": [
            {
              "text": "Question text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "difficulty": "Easy|Moderate|Hard",
              "marks": number
            }
          ]
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const parsed = extractJsonObject(text);
    const validated = GeneratedPaperSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error('AI response did not match expected schema');
    }

    // Normalize: trim question text/options
    return {
      sections: validated.data.sections.map((s) => ({
        ...s,
        title: s.title.trim(),
        description: s.description.trim(),
        questions: s.questions.map((q) => ({
          ...q,
          text: q.text.trim(),
          options: q.options?.map((o) => o.trim()).filter(Boolean),
          correctAnswer: q.correctAnswer?.trim(),
        })),
      })),
    };
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};
