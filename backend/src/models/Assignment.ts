import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  options?: string[];
  correctAnswer?: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  title: string;
  description: string;
  questions: IQuestion[];
}

export interface IQuestionType {
  type: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  grade: string;
  dueDate: Date;
  questionTypes: IQuestionType[];
  totalMarks: number;
  totalQuestions: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sections: ISection[];
  additionalInstructions?: string;
  createdAt: Date;
}

const QuestionTypeSchema = new Schema<IQuestionType>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], required: true },
  marks: { type: Number, required: true },
});

const SectionSchema = new Schema<ISection>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  questions: [QuestionSchema],
});

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  dueDate: { type: Date, required: true },
  questionTypes: { type: [QuestionTypeSchema], required: true, default: [] },
  totalMarks: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  sections: [SectionSchema],
  additionalInstructions: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
