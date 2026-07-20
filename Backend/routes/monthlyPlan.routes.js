const express = require('express');
const {
    createHeader,
    listHeaders,
    getHeader,
    listDetails,
    addDetail,
    updateDetail,
    deleteDetail,
    createFullPlan,
    generatePlanNumber,
    deleteHeader,
} = require('../controllers/monthlyPlan.controller');

const router = express.Router();


// static paths BEFORE dynamic /:id — order matters in Express
router.post('/full', createFullPlan);
router.get('/next-number', generatePlanNumber);
router.post('/', createHeader);
router.get('/', listHeaders);

router.get('/:id', getHeader);
router.delete('/:id', deleteHeader);

router.get('/:id/details', listDetails);
router.post('/:id/details', addDetail);
router.put('/:id/details/:detailId', updateDetail);
router.delete('/:id/details/:detailId', deleteDetail);

module.exports = router;