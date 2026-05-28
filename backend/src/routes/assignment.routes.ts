import { Router } from 'express';
import multer from 'multer';
import { createAssignment, getAssignment, regenerateAssignment } from '../controllers/assignment.controller.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/', upload.single('file'), createAssignment);
router.get('/:id', getAssignment);
router.post('/:id/regenerate', regenerateAssignment);

export default router;
