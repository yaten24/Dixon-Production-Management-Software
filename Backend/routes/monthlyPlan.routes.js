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
    generatePlanNumber
} = require('../controllers/monthlyPlan.controller');

const router = express.Router();

console.log({
    createHeader,
    listHeaders,
    getHeader,
    listDetails,
    addDetail,
    updateDetail,
    deleteDetail,
    createFullPlan,
    generatePlanNumber,
});

// router.post('/', createHeader);
router.post('/full', createFullPlan);
router.get('/next-number', generatePlanNumber);
// router.get('/', listHeaders);
// router.get('/:id', getHeader);
// router.get('/:id/details', listDetails);
// router.post('/:id/details', addDetail);
// router.put('/:id/details/:detailId', updateDetail);
// router.delete('/:id/details/:detailId', deleteDetail);

module.exports = router;