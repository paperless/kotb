const router = require('express').Router();
const controller = require('../../controllers/api/games');
const { auth } = require('../../middleware/auth');

router.post('/', auth, controller.validate('create'), controller.create);
router.get('/', controller.list);

module.exports = router;
