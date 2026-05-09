import { Router } from 'express';
import { ScheduleService } from '../services/schedule.service.js';

const router = Router();
const scheduleService = new ScheduleService();

router.post('/generate', async (req, res) => {
  try {
    const { algorithm } = req.query; // GA, SA, etc.
    if (!algorithm) return res.status(400).json({ error: 'Missing algorithm parameter' });
    
    const result = await scheduleService.generateSchedule(algorithm);
    res.json({
      message: `Schedule generated using ${algorithm}`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;