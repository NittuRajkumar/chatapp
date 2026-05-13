const router = require('express').Router();
const auth = require('../middleware/auth');
const { getRooms, createRoom, getRoom, getRoomMessages } = require('../controllers/room.controller');

router.get('/', auth, getRooms);
router.post('/', auth, createRoom);
router.get('/:id', auth, getRoom);
router.get('/:id/messages', auth, getRoomMessages);

module.exports = router;