const express = require('express');
const router = express.Router();
const {getUserByUsername} = require('../controllers/users')

router.route('/:username')
    .get(getUserByUsername)

module.exports = router;