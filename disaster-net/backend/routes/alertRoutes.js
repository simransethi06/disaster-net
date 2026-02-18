import express from 'express';
import {
  getAllAlerts,
  getNearbyAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertsByUrgency,
  getAlertStats
} from '../controllers/alertController.js';

const router = express.Router();

// Alert routes
router.route('/')
  .get(getAllAlerts)
  .post(createAlert);

router.get('/nearby', getNearbyAlerts);
router.get('/stats', getAlertStats);
router.get('/urgency/:level', getAlertsByUrgency);

router.route('/:id')
  .get(getAlert)
  .put(updateAlert)
  .delete(deleteAlert);

export default router;