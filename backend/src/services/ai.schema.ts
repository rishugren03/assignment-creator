import { z } from 'zod';

export const DifficultySchema = z.enum(['Easy', 'Moderate', 'Hard']);

export const QuestionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string().min(1)).optional(),
  correctAnswer: z.string().min(1).optional(),
  difficulty: DifficultySchema,
  marks: z.number().int().positive(),
});

export const SectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

export const GeneratedPaperSchema = z.object({
  sections: z.array(SectionSchema).min(1),
});

export type GeneratedPaper = z.infer<typeof GeneratedPaperSchema>;

