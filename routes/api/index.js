var router = require('express').Router();

router.use('/games', require('./games'));
router.use('/players', require('./players'));
router.use('/participations', require('./participations'));
router.use('/auth', require('./auth'));

module.exports = router;
