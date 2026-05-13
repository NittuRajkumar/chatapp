const router = require('express').Router();
const auth = require('../middleware/auth');
const { getUsers } = require('../controllers/user.controller');

router.get('/', auth, getUsers);

module.exports = router;