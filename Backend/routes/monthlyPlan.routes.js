const router = require('express').Router();
const ctrl = require('../controllers/monthlyPlan.controller');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', requireRole('planner', 'admin'), ctrl.createHeader);
router.get('/', ctrl.listHeaders);
router.get('/:id', ctrl.getHeader);

router.get('/:id/details', ctrl.listDetails);
router.post('/:id/details', requireRole('planner', 'admin'), ctrl.addDetail);
router.put('/:id/details/:detailId', requireRole('planner', 'admin'), ctrl.updateDetail);
router.delete('/:id/details/:detailId', requireRole('planner', 'admin'), ctrl.deleteDetail);

module.exports = router;