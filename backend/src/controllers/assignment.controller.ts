import { Request, Response } from 'express';
import Assignment from '../models/Assignment.js';
import { assignmentQueue } from '../config/queue.js';
import fs from 'fs/promises';
import * as pdfParseImport from 'pdf-parse';

const pdfParse = ((pdfParseImport as any).default ?? (pdfParseImport as any)) as (data: Buffer) => Promise<{ text?: string }>;

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { title, subject, grade, dueDate, questionTypes, additionalInstructions } = req.body;
    
    // Parse questionTypes if it's sent as a string (common with FormData/file upload)
    let parsedQuestionTypes = questionTypes;
    if (typeof questionTypes === 'string') {
      parsedQuestionTypes = JSON.parse(questionTypes);
    }

    // Basic validation (avoid empty / negative values)
    if (!title || !subject || !grade || !dueDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!Array.isArray(parsedQuestionTypes) || parsedQuestionTypes.length === 0) {
      return res.status(400).json({ error: 'questionTypes must be a non-empty array' });
    }
    for (const qt of parsedQuestionTypes) {
      const count = Number(qt?.count);
      const marks = Number(qt?.marks);
      if (!qt?.type || !Number.isFinite(count) || !Number.isFinite(marks) || count <= 0 || marks <= 0) {
        return res.status(400).json({ error: 'Invalid questionTypes: type/count/marks are required and must be positive' });
      }
    }

    let fileContent = '';
    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const dataBuffer = await fs.readFile(req.file.path);
        const result = await pdfParse(dataBuffer);
        fileContent = result.text || '';
      } else {
        fileContent = await fs.readFile(req.file.path, 'utf-8');
      }
      // Cleanup file after reading
      await fs.unlink(req.file.path).catch(console.error);
    }

    const totalQuestions = parsedQuestionTypes.reduce((acc: number, qt: any) => acc + parseInt(qt.count), 0);
    const totalMarks = parsedQuestionTypes.reduce((acc: number, qt: any) => acc + (parseInt(qt.count) * parseInt(qt.marks)), 0);

    const assignment = new Assignment({
      title,
      subject,
      grade,
      dueDate,
      questionTypes: parsedQuestionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions: additionalInstructions + (fileContent ? `\n\nReference Document Content:\n${fileContent}` : ''),
      status: 'pending',
    });

    await assignment.save();

    // Add to queue
    await assignmentQueue.add('generate', {
      assignmentId: assignment._id,
      data: { 
        subject, 
        grade, 
        questionTypes: parsedQuestionTypes, 
        additionalInstructions: assignment.additionalInstructions 
      },
    });

    res.status(201).json({ assignmentId: assignment._id });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get assignment' });
  }
};

export const regenerateAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Reset status/sections before enqueue
    assignment.status = 'pending';
    assignment.sections = [];
    await assignment.save();

    await assignmentQueue.add('generate', {
      assignmentId: assignment._id,
      data: {
        subject: assignment.subject,
        grade: assignment.grade,
        questionTypes: assignment.questionTypes || [],
        additionalInstructions: assignment.additionalInstructions || '',
      },
    });

    res.json({ assignmentId: assignment._id });
  } catch (error) {
    console.error('Error regenerating assignment:', error);
    res.status(500).json({ error: 'Failed to regenerate assignment' });
  }
};
