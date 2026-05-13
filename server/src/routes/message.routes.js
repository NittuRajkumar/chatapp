const router = require('express').Router();
const auth = require('../middleware/auth');
const { editMessage, deleteMessage } = require('../controllers/message.controller');

router.put('/:id', auth, editMessage);
router.delete('/:id', auth, deleteMessage);

module.exports = router;