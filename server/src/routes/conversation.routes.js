const router = require('express').Router();
const auth = require('../middleware/auth');
const { getConversations, createConversation, getConversationMessages } = require('../controllers/conversation.controller');

router.get('/', auth, getConversations);
router.post('/', auth, createConversation);
router.get('/:id/messages', auth, getConversationMessages);

module.exports = router;