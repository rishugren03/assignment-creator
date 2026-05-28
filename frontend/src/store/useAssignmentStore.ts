import { create } from 'zustand';

interface QuestionType {
  type: string;
  count: number;
  marks: number;
}

interface AssignmentState {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInstructions: string;
  status: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  assignmentId: string | null;
  
  setField: <K extends AssignmentField>(field: K, value: AssignmentState[K]) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: <K extends keyof QuestionType>(index: number, field: K, value: QuestionType[K]) => void;
  setStatus: (status: AssignmentState['status']) => void;
  setAssignmentId: (id: string) => void;
}

type AssignmentField = 'title' | 'subject' | 'grade' | 'dueDate' | 'additionalInstructions';

export const useAssignmentStore = create<AssignmentState>((set) => ({
  title: '',
  subject: '',
  grade: '',
  dueDate: '',
  questionTypes: [{ type: 'Multiple Choice Questions', count: 5, marks: 1 }],
  additionalInstructions: '',
  status: 'idle',
  assignmentId: null,

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  
  addQuestionType: () => set((state) => ({
    questionTypes: [...state.questionTypes, { type: 'Short Answer Questions', count: 5, marks: 2 }]
  })),

  removeQuestionType: (index) => set((state) => ({
    questionTypes: state.questionTypes.filter((_, i) => i !== index)
  })),

  updateQuestionType: (index, field, value) => set((state) => {
    const newQuestionTypes = [...state.questionTypes];
    newQuestionTypes[index] = { ...newQuestionTypes[index], [field]: value } as QuestionType;
    return { questionTypes: newQuestionTypes };
  }),

  setStatus: (status) => set({ status }),
  setAssignmentId: (id) => set({ assignmentId: id }),
}));
