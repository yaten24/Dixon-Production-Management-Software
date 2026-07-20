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
const authMiddleware = require("../middlewares/authMiddleware");


const router = express.Router();

router.use(authMiddleware);


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