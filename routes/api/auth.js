const router = require('express').Router();
const controller = require('../../controllers/api/auth');
const { auth } = require('../../middleware/auth');

router.post('/', controller.validate('auth'), controller.token);
router.get('/check', auth, controller.check);

module.exports = router;
