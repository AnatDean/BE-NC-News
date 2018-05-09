const express = require('express');
const router = express.Router();
const {incrementCommentVote} = require('../controllers/comments.js')


router.route('/:_id')
    .put(incrementCommentVote)


module.exports = router;