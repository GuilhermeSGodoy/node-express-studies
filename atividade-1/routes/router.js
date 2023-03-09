const router = require('express').Router();

const baseRouter = require('./bases');
router.use('/', baseRouter);

module.exports = router;