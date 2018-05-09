const express = require('express');
const router = express.Router();
const {incrementCommentVote, deleteComment} = require('../controllers/comments.js')


router.route('/:_id')
    .put(incrementCommentVote)
    .delete(deleteComment)

module.exports = router;