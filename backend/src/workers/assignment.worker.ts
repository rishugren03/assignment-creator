import { Worker, Job } from 'bullmq';
import { connection } from '../config/queue.js';
import Assignment from '../models/Assignment.js';
import { generateQuestions } from '../services/ai.service.js';
import { io } from '../index.js';

async function cacheStatus(assignmentId: string, status: string) {
  try {
    // Keep short-lived status cache for fast reads / refreshes
    await connection.set(`assignment:${assignmentId}:status`, status, 'EX', 60 * 30);
  } catch (e) {
    // Best-effort cache; do not fail job
    console.warn('Redis status cache failed:', e);
  }
}

export const assignmentWorker = new Worker(
  'assignment-generation',
  async (job: Job) => {
    const { assignmentId, data } = job.data;

    try {
      // Update status to processing
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      await cacheStatus(assignmentId, 'processing');
      io.to(assignmentId).emit('assignment-status', { status: 'processing' });

      // Generate questions
      const result = await generateQuestions(data);

      // Save to DB
      await Assignment.findByIdAndUpdate(assignmentId, {
        sections: result.sections,
        status: 'completed',
      });
      await cacheStatus(assignmentId, 'completed');

      // Notify frontend
      io.to(assignmentId).emit('assignment-status', { status: 'completed', assignmentId });
      console.log(`Assignment ${assignmentId} completed successfully`);
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
      await cacheStatus(assignmentId, 'failed');
      io.to(assignmentId).emit('assignment-status', { status: 'failed' });
      throw error;
    }
  },
  { connection }
);
