const express = require('express');
const router = express.Router();
const {getAllArticles, getArticleById, addComment} = require('../controllers/articles')

router.route('/')
    .get(getAllArticles)

router.route('/:_id')
    .get(getArticleById)
    .post(addComment)


module.exports = router;